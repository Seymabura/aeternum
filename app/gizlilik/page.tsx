import { Contact, LegalPage } from "@/components/legal";

export const metadata = { title: "Gizlilik" };

export default function Privacy() {
  return (
    <LegalPage title="Gizlilik" updated="22 Kasım 2026">
      <p>
        Aeternum, yılın sonuna doğru tuttuğun kişisel bir defter. Yazdıkların ve yüklediklerin <b>varsayılan olarak sadece
        sana görünür</b>. Kimseye satmıyoruz, reklam için kullanmıyoruz.
      </p>
      <h2>Neleri saklıyoruz?</h2>
      <ul>
        <li>Hesap bilgileri: e-posta adresin, (Google ile girdiysen) adın, şifren (şifrelenmiş olarak, biz göremeyiz).</li>
        <li>Görev cevapların, küçük ışık cevapların, 2027&apos;ye mektubun.</li>
        <li>Vision board'un, 2027 hedeflerin ve yüklediğin fotoğraflar.</li>
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
      <h2>Biz bölümü (sevgililer)</h2>
      <ul>
        <li>Doğduğun gecenin Ay'ı ve gökyüzü haritası için girdiğin tarihler, saatler ve şehirler <b>sadece cihazında hesaplanır, kaydedilmez</b>.</li>
                <li>
          <b>Bağlantı oluştur</b> dediğinde ve açıkça onay verdiğinde, yalnızca görselleştirme için gereken en az bilgi (isimler,
          görünen tarih metni, Ay ve yıldız hesap sonuçları) bağlantıyı bilen herkesin
          görebileceği bir sayfada saklanır. Bağlantıyı Biz sayfasından istediğin an silebilirsin; fotoğraflar da silinir.
        </li>
      </ul>
      <h2>Ortak defter</h2>
      <ul>
        <li>Defterdeki cevapların yalnızca eşleştiğin kişiyle paylaşılır; o da kendi cevabını yazmadan seninkini göremez.</li>
        <li>Eşleşmeden ayrıldığında defter ve içindeki tüm cevaplar silinir.</li>
      </ul>
      <h2>Dilek feneri</h2>
      <ul>
        <li>Bıraktığın fenerin yazısını ve tarihini saklıyoruz. &ldquo;Sadece ben göreyim&rdquo; demediysen dilek ortak gökyüzünde <b>isimsiz</b> görünür; kimin bıraktığı kimseye gösterilmez.</li>
        <li>Fenerine dokunup &ldquo;Fenerimi söndür&rdquo; dediğin an silinir. Üç kişi uygunsuz diye bildirirse fener otomatik olarak gizlenir.</li>
        <li>Fenerlere bağlantı, kullanıcı adı ve telefon numarası yazılamaz; kendi bilgilerini yazmamanı öneririz.</li>
      </ul>
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
