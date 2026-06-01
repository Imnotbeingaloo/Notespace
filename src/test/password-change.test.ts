import { describe, it, expect, vi } from "vitest";
import { changePassword } from "@/lib/password-change";

const baseDeps = (overrides: Partial<Parameters<typeof changePassword>[0]> = {}) => ({
  email: "user@example.com",
  currentPw: "correct-pass",
  newPw: "brand-new-pass",
  confirmPw: "brand-new-pass",
  canChange: true,
  cooldownDays: 0,
  signInWithPassword: vi.fn(async () => ({ error: null })),
  updateUser: vi.fn(async () => ({ error: null })),
  markPasswordChanged: vi.fn(async () => {}),
  ...overrides,
});

describe("changePassword reauth flow", () => {
  it("blocks when current password is wrong and never calls updateUser", async () => {
    const updateUser = vi.fn(async () => ({ error: null }));
    const signInWithPassword = vi.fn(async () => ({ error: { message: "Invalid login credentials" } }));
    const deps = baseDeps({ currentPw: "wrong", signInWithPassword, updateUser });

    const res = await changePassword(deps);

    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.field).toBe("current");
      expect(res.message).toMatch(/incorrect/i);
    }
    expect(signInWithPassword).toHaveBeenCalledOnce();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("translates rate-limit errors into a friendly message", async () => {
    const deps = baseDeps({
      signInWithPassword: vi.fn(async () => ({ error: { message: "Too many requests" } })),
    });
    const res = await changePassword(deps);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/too many attempts/i);
  });

  it("allows update only after successful reauth", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const updateUser = vi.fn(async () => ({ error: null }));
    const markPasswordChanged = vi.fn(async () => {});
    const deps = baseDeps({ signInWithPassword, updateUser, markPasswordChanged });

    const res = await changePassword(deps);

    expect(res.ok).toBe(true);
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "correct-pass",
    });
    expect(updateUser).toHaveBeenCalledWith({ password: "brand-new-pass" });
    expect(markPasswordChanged).toHaveBeenCalledOnce();

    // Reauth must happen before the update — order matters.
    const reauthOrder = signInWithPassword.mock.invocationCallOrder[0];
    const updateOrder = updateUser.mock.invocationCallOrder[0];
    expect(reauthOrder).toBeLessThan(updateOrder);
  });

  it("requires the current password field", async () => {
    const updateUser = vi.fn(async () => ({ error: null }));
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const res = await changePassword(baseDeps({ currentPw: "", signInWithPassword, updateUser }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.field).toBe("current");
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("rejects mismatching new passwords before contacting the server", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const res = await changePassword(
      baseDeps({ confirmPw: "different", signInWithPassword })
    );
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.field).toBe("confirm");
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects reuse of the current password", async () => {
    const res = await changePassword(baseDeps({ newPw: "correct-pass", confirmPw: "correct-pass" }));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.field).toBe("new");
  });

  it("respects the 30-day cooldown", async () => {
    const res = await changePassword(baseDeps({ canChange: false, cooldownDays: 12 }));
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.field).toBe("cooldown");
      expect(res.message).toMatch(/12 days/);
    }
  });

  it("surfaces HIBP/breach errors from updateUser with a friendly message", async () => {
    const deps = baseDeps({
      updateUser: vi.fn(async () => ({ error: { message: "Password has been pwned" } })),
    });
    const res = await changePassword(deps);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.message).toMatch(/data breach/i);
  });
});
