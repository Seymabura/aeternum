import { Contact, LegalPage } from "@/components/legal";

export const metadata = { title: "Gizlilik" };

export default function Privacy() {
  return (
    <LegalPage title="Gizlilik" updated="20 Kasım 2026">
      <p>
        Aeternum, yılın sonuna doğru tuttuğun kişisel bir defter. Yazdıkların ve yüklediklerin <b>varsayılan olarak sadece
        sana görünür</b>. Kimseye satmıyoruz, reklam için kullanmıyoruz.
      </p>
      <h2>Neleri saklıyoruz?</h2>
      <ul>
        <li>Hesap bilgileri: e-posta adresin, (Google ile girdiysen) adın, şifren (şifrelenmiş olarak, biz göremeyiz).</li>
        <li>Görev cevapların, küçük ritüel notların, 2027&apos;ye mektubun.</li>
        <li>Wishlist'in, vision board'un, duvar kağıdı tasarımların ve yüklediğin fotoğraflar.</li>
        <li>Tercihlerin (ör. hatırlatma e-postası istiyor musun).</li>
      </ul>
      <h2>Nasıl koruyoruz?</h2>
      <ul>
        <li>Veritabanında her satır sahibine kilitli (Row Level Security): başka bir kullanıcı senin verini okuyamaz.</li>
        <li>Fotoğraflar gizli bir depoda tutulur ve sadece sana özel, süreli linklerle gösterilir.</li>
        <li>Bağlantılar HTTPS ile şifrelenir.</li>
      </ul>
      <h2>Kimlerle paylaşılıyor?</h2>
      <p>
        Sadece siteyi çalıştırmak için kullandığımız altyapı hizmetleri: Supabase (veritabanı, giriş, dosya deposu), Vercel
        (barındırma) ve ileride e-posta gönderimi için Resend. Herkese açık galeri ve teşekkür kartları gibi özellikler
        geldiğinde, yalnızca senin açıkça paylaştığın içerik görünür olur.
      </p>
      <h2>Çerezler</h2>
      <p>Yalnızca oturumunu açık tutmak için gerekli çerezleri kullanıyoruz. Takip ya da reklam çerezi yok.</p>
      <h2>Silme hakkın</h2>
      <p>
        Profil sayfasındaki <b>Hesabımı ve tüm verilerimi sil</b> düğmesiyle hesabını, cevaplarını, panolarını ve
        fotoğraflarını kalıcı olarak silebilirsin. Sorular için: <Contact />.
      </p>
    </LegalPage>
  );
}
