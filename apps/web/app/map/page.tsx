"use client";
import { ProtectedPage } from "../../src/components/auth-forms";
export default function MapPage() {
  return (
    <ProtectedPage>
      <main className="map-page">
        <div className="map-card">
          <p className="eyebrow">HSK Mind · Main Map</p>
          <h1>เส้นทางการฝึกของคุณ</h1>
          <p>
            HSK1 พร้อมเริ่มต้นแล้ว เมืองถัดไปจะปลดล็อกตาม progression จาก server
          </p>
          <div className="scope-grid">
            {["HSK1", "HSK2", "HSK3", "HSK4"].map((level, index) => (
              <div
                className={`scope-card ${index === 0 ? "active" : "locked"}`}
                key={level}
              >
                <strong>{level}</strong>
                <span>{index === 0 ? "พร้อมฝึก" : "ล็อกตาม progression"}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
