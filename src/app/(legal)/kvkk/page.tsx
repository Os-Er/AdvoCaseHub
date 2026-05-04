import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni — AdvoCaseHub",
  description: "AdvoCaseHub kişisel verilerin korunması kanunu kapsamında aydınlatma metni.",
};

export default function KvkkPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "#1B2A4A" }}>
        KVKK Aydınlatma Metni
      </h1>
      <p className="text-sm text-slate-500 mb-8">Son güncelleme: Mayıs 2026</p>

      <Section title="1. Veri Sorumlusu">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz;
          veri sorumlusu sıfatıyla <strong>AdvoCaseHub</strong> tarafından aşağıda açıklanan
          kapsamda işlenecektir.
        </p>
      </Section>

      <Section title="2. İşlenen Kişisel Veriler">
        <ul>
          <li><strong>Kimlik verileri:</strong> Ad, soyad</li>
          <li><strong>İletişim verileri:</strong> E-posta adresi</li>
          <li><strong>İşlem verileri:</strong> Sisteme giriş zamanları, gerçekleştirilen işlemler (audit log)</li>
          <li><strong>Mesleki veriler:</strong> Sisteme girilen dava dosyası, vekaletname ve makbuz bilgileri</li>
        </ul>
      </Section>

      <Section title="3. Kişisel Verilerin İşlenme Amaçları">
        <ul>
          <li>Üyelik ve kimlik doğrulama işlemlerinin yürütülmesi</li>
          <li>Avukatlık yönetim hizmetinin sunulması</li>
          <li>Hizmet güvenliğinin ve bütünlüğünün sağlanması</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Destek taleplerinin karşılanması</li>
        </ul>
      </Section>

      <Section title="4. Hukuki Sebepler">
        <p>Kişisel verileriniz;</p>
        <ul>
          <li>Sözleşmenin kurulması ve ifası (KVKK md. 5/2-c)</li>
          <li>Meşru menfaat (KVKK md. 5/2-f)</li>
          <li>Açık rıza (KVKK md. 5/1) — pazarlama faaliyetleri için</li>
        </ul>
        <p>hukuki sebeplerine dayanılarak işlenmektedir.</p>
      </Section>

      <Section title="5. Kişisel Verilerin Aktarılması">
        <p>
          Kişisel verileriniz; altyapı hizmetleri kapsamında <strong>Supabase Inc.</strong> (veritabanı
          ve kimlik doğrulama) ile <strong>Vercel Inc.</strong> (barındırma) sunucularında
          işlenmektedir. Bu aktarımlar KVKK'nın 9. maddesi kapsamında uygun güvenceler sağlanarak
          gerçekleştirilmektedir.
        </p>
      </Section>

      <Section title="6. Veri Saklama Süreleri">
        <ul>
          <li>Hesap verileri: Hesap silinene kadar</li>
          <li>Dava/makbuz/vekaletname verileri: Avukatın talebi ile silinene kadar</li>
          <li>Audit log kayıtları: 2 yıl</li>
        </ul>
      </Section>

      <Section title="7. Haklarınız">
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse bilgi talep etme</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini isteme</li>
          <li>Silinmesini veya yok edilmesini isteme</li>
          <li>İşlemenin otomatik sistemler vasıtasıyla gerçekleştirilmesi hâlinde ortaya çıkan
            sonuca itiraz etme</li>
          <li>Zarara uğramanız hâlinde tazminat talep etme</li>
        </ul>
        <p>
          Haklarınızı kullanmak için{" "}
          <a href="mailto:destek@advocasehub.com" style={{ color: "#C9A84C" }}>
            destek@advocasehub.com
          </a>{" "}
          adresine başvurabilirsiniz.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-slate-200" style={{ color: "#1B2A4A" }}>
        {title}
      </h2>
      <div className="text-slate-600 text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
