"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../lib/api";
import { AuthShell } from "./auth-shell";

type MeResponse = {
  user: { profile: { onboardingCompleted: boolean } | null };
};

function Field({
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  error,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
      />
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();
  return (
    <div className="form-field">
      <label htmlFor={inputId}>{label}</label>
      <span className="password-input">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          className="visibility-toggle"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
        >
          {visible ? "ซ่อน" : "แสดง"}
        </button>
      </span>
      {error ? <small className="field-error">{error}</small> : null}
    </div>
  );
}

function FormNotice({
  message,
  success = false,
}: {
  message?: string;
  success?: boolean;
}) {
  return message ? (
    <p
      className={success ? "form-notice success" : "form-notice"}
      role="status"
    >
      {message}
    </p>
  ) : null;
}

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (password !== confirm) return setError("รหัสผ่านยืนยันไม่ตรงกัน");
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/onboarding");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "สมัครสมาชิกไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="สร้างบัญชี"
      eyebrow="เริ่มเส้นทาง HSK Mind"
      background="/design-reference/auth/register/Background.png"
    >
      <form className="auth-form" onSubmit={submit} noValidate>
        <Field
          label="อีเมล"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <PasswordField
          label="รหัสผ่าน"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="ยืนยันรหัสผ่าน"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <FormNotice message={error} />
        <button className="primary-button" disabled={loading}>
          {loading ? "กำลังสร้างบัญชี…" : "สมัครสมาชิก"}
        </button>
        <p className="auth-link">
          มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch<{ next: "map" | "onboarding" }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) },
      );
      router.push(`/${result.next}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "เข้าสู่ระบบไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="เข้าสู่ระบบ"
      eyebrow="กลับไปฝึกต่อ"
      background="/design-reference/auth/login/Background.png"
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="อีเมล"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <PasswordField
          label="รหัสผ่าน"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <FormNotice message={error} />
        <button className="primary-button" disabled={loading}>
          {loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
        <Link className="text-link centered" href="/forgot-password">
          ลืมรหัสผ่าน?
        </Link>
        <p className="auth-link">
          ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await apiFetch<{ message: string }>(
        "/auth/forgot-password",
        { method: "POST", body: JSON.stringify({ email }) },
      );
      setMessage(result.message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ส่งคำขอไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="กู้คืนรหัสผ่าน"
      eyebrow="Forgot Password"
      background="/design-reference/auth/forgot Password/Background.png"
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="อีเมล"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <FormNotice message={error} />
        <FormNotice message={message} success />
        <button className="primary-button" disabled={loading}>
          {loading ? "กำลังส่ง…" : "ขอรีเซ็ตรหัสผ่าน"}
        </button>
        <Link className="text-link centered" href="/login">
          กลับเข้าสู่ระบบ
        </Link>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (password.length < 8)
      return setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
    if (password !== confirm) return setError("รหัสผ่านยืนยันไม่ตรงกัน");
    setLoading(true);
    try {
      const result = await apiFetch<{ message: string }>(
        "/auth/reset-password",
        { method: "POST", body: JSON.stringify({ token, password }) },
      );
      setMessage(result.message);
      setTimeout(() => router.push("/login"), 900);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Token ไม่ถูกต้องหรือหมดอายุ",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="ตั้งรหัสผ่านใหม่"
      eyebrow="Reset Password · inferred design"
      background="/design-reference/auth/forgot Password/Background.png"
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="Reset token"
          value={token}
          onChange={setToken}
          autoComplete="one-time-code"
        />
        <PasswordField
          label="รหัสผ่านใหม่"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="ยืนยันรหัสผ่านใหม่"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />
        <FormNotice message={error} />
        <FormNotice message={message} success />
        <button className="primary-button" disabled={loading}>
          {loading ? "กำลังบันทึก…" : "ตั้งรหัสผ่านใหม่"}
        </button>
      </form>
    </AuthShell>
  );
}

const avatars = ["avatar_01", "avatar_02", "avatar_03", "avatar_04"];
export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("avatar_01");
  const [target, setTarget] = useState("HSK1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/onboarding/complete", {
        method: "POST",
        body: JSON.stringify({
          displayName: name,
          avatarKey: avatar,
          targetHsk: target,
        }),
      });
      router.push("/map");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "บันทึกข้อมูลไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="สร้างตัวตนของคุณ"
      eyebrow="Onboarding"
      background="/design-reference/auth/onboarding/Background.png"
    >
      <form className="auth-form" onSubmit={submit}>
        <Field
          label="ชื่อผู้เล่น"
          value={name}
          onChange={setName}
          autoComplete="nickname"
        />
        <fieldset>
          <legend>เลือก Avatar</legend>
          <div className="avatar-grid">
            {avatars.map((item) => (
              <button
                type="button"
                key={item}
                className={`avatar-option ${avatar === item ? "selected" : ""}`}
                onClick={() => setAvatar(item)}
                aria-pressed={avatar === item}
              >
                <img
                  src={`/design-reference/auth/onboarding/${item}.png`}
                  alt={`Avatar ${item.slice(-2)}`}
                />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="form-field">
          <span>เป้าหมาย HSK</span>
          <select
            value={target}
            onChange={(event) => setTarget(event.target.value)}
          >
            {["HSK1", "HSK2", "HSK3", "HSK4"].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <small>เป้าหมายเป็น preference เท่านั้น ทุกคนเริ่มจาก HSK1</small>
        </label>
        <FormNotice message={error} />
        <button className="primary-button" disabled={loading}>
          {loading ? "กำลังเริ่มการฝึก…" : "เริ่มการฝึก"}
        </button>
      </form>
    </AuthShell>
  );
}

export function ProtectedPage({
  children,
  requireOnboarding = true,
}: {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    apiFetch<MeResponse>("/auth/me")
      .then((result) => {
        const complete = Boolean(result.user.profile?.onboardingCompleted);
        if (requireOnboarding && !complete) router.replace("/onboarding");
        else if (!requireOnboarding && complete) router.replace("/map");
        else setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router, requireOnboarding]);
  if (!ready)
    return (
      <main className="loading-page">
        <p>กำลังตรวจสอบ session…</p>
      </main>
    );
  return children;
}
