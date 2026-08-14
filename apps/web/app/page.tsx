import Link from "next/link";

const scope = [
  ["HSK1", "เริ่มต้นจากพื้นฐาน"],
  ["HSK2", "ต่อยอดคำศัพท์ใช้บ่อย"],
  ["HSK3", "สื่อสารได้คล่องขึ้น"],
  ["HSK4", "ก้าวสู่ระดับกลาง"],
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="เมนูหลัก">
        <img src="/assets/landing/logo.png" alt="HSK Mind" />
        <div>
          <Link href="/login">เข้าสู่ระบบ</Link>
          <Link className="nav-cta" href="/register">
            เริ่มการฝึก
          </Link>
        </div>
      </nav>
      <section className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">HSK MIND · HSK 1–4</p>
          <h1>
            ฝึกภาษาจีนให้สนุก
            <br />
            <span>จำได้จริง</span>
          </h1>
          <p>
            เส้นทางเรียนรู้คำศัพท์จีนแบบเป็นขั้นตอน
            พร้อมเกมและความก้าวหน้าที่ชัดเจนสำหรับ HSK 1–4
          </p>
          <div className="hero-actions">
            <Link className="primary-button" href="/register">
              เริ่มการฝึก
            </Link>
            <Link className="secondary-button" href="/login">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
        <div
          className="hero-visual"
          aria-label="เส้นทางการเรียน HSK 1 ถึง HSK 4"
        >
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <div className="hero-level hero-level-one">
            <span>一</span>
            <strong>HSK1</strong>
          </div>
          <div className="hero-level hero-level-two">
            <span>二</span>
            <strong>HSK2</strong>
          </div>
          <div className="hero-level hero-level-three">
            <span>三</span>
            <strong>HSK3</strong>
          </div>
          <div className="hero-level hero-level-four">
            <span>四</span>
            <strong>HSK4</strong>
          </div>
          <p>
            ฝึกทีละด่าน
            <br />
            <strong>เติบโตทีละขั้น</strong>
          </p>
        </div>
      </section>
      <section className="landing-section" aria-labelledby="scope-title">
        <p className="eyebrow">YOUR JOURNEY</p>
        <h2 id="scope-title">เรียนรู้ตามเส้นทาง HSK 1–4</h2>
        <div className="scope-grid">
          {scope.map(([level, description]) => (
            <article className="scope-card active" key={level}>
              <strong>{level}</strong>
              <span>{description}</span>
            </article>
          ))}
        </div>
      </section>
      <section
        className="landing-section feature-section"
        aria-labelledby="feature-title"
      >
        <div>
          <p className="eyebrow">CURRENT DATASET</p>
          <h2 id="feature-title">พื้นฐานที่พร้อมให้คุณเริ่ม</h2>
          <p>
            ข้อมูลคำศัพท์ปัจจุบันมี 2,000 รายการ ครอบคลุม HSK1–HSK4 และแบ่งเป็น
            stage ละไม่เกิน 20 คำ
          </p>
          <p className="muted-note">
            ฟีเจอร์ที่ยังไม่อยู่ใน MVP จะไม่แสดงเป็นฟีเจอร์ที่พร้อมใช้งาน
          </p>
        </div>
        <img
          src="/assets/landing/landing-features.png"
          alt="ตัวอย่างองค์ประกอบ HSK Mind"
        />
      </section>
      <footer className="landing-footer">
        HSK Mind · เริ่มจาก HSK1 และค่อย ๆ ก้าวไปด้วยกัน
      </footer>
    </main>
  );
}
