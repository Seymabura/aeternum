import { Contact, LegalPage } from "@/components/legal";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function Kvkk() {
  return (
    <LegalPage title="KVKK Aydınlatma Metni" updated="20 Kasım 2026">
      <p>
        Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun (&quot;KVKK&quot;) 10. maddesi uyarınca, Aeternum
        (&quot;Site&quot;) kullanıcılarını kişisel verilerinin işlenmesi hakkında bilgilendirmek için hazırlanmıştır.
      </p>
      <h2>1. Veri sorumlusu</h2>
      <p>Aeternum, bireysel bir proje olarak site sahibi tarafından işletilmektedir. İletişim: <Contact />.</p>
      <h2>2. İşlenen kişisel veriler</h2>
      <ul>
        <li>Kimlik ve iletişim: ad (isteğe bağlı), e-posta adresi.</li>
        <li>Kullanıcı içeriği: görev cevapları, notlar, mektuplar, wishlist, vision board, duvar kağıdı tasarımları, yüklenen fotoğraflar.</li>
        <li>İşlem güvenliği: oturum bilgileri, giriş zamanları.</li>
      </ul>
      <h2>3. İşleme amaçları</h2>
      <ul>
        <li>Hesabının oluşturulması ve oturumunun yönetilmesi,</li>
        <li>Günlük görev takvimi, kar küresi, wishlist, vision board, duvar kağıdı stüdyosu ve yıl sonu özeti hizmetlerinin sunulması,</li>
        <li>İstemen halinde hatırlatma ve zaman kapsülü e-postalarının gönderilmesi,</li>
        <li>Sitenin güvenliğinin sağlanması ve kötüye kullanımın önlenmesi.</li>
      </ul>
      <h2>4. Hukuki sebepler</h2>
      <p>
        Kişisel verilerin KVKK m.5/2-c (sözleşmenin kurulması ve ifası), m.5/2-f (meşru menfaat: güvenlik) ve isteğe bağlı
        e-postalar için m.5/1 (açık rıza) hukuki sebeplerine dayanılarak işlenir.
      </p>
      <h2>5. Aktarım</h2>
      <p>
        Veriler, hizmetin sunulması için kullanılan yurt dışında yerleşik altyapı sağlayıcılarına (Supabase, Vercel, Resend)
        KVKK m.9 kapsamında aktarılabilir. Bu sağlayıcılar verileri yalnızca hizmet sunmak için işler.
      </p>
      <h2>6. Toplama yöntemi</h2>
      <p>Veriler, siteye kayıt olurken ve siteyi kullanırken senin tarafından elektronik ortamda sağlanır.</p>
      <h2>7. Saklama süresi</h2>
      <p>
        Veriler hesabın açık olduğu sürece saklanır. Zaman kapsülü mektupları, teslim tarihi olan 31 Aralık 2027&apos;ye kadar
        tutulur. Hesabını sildiğinde verilerin kalıcı olarak silinir.
      </p>
      <h2>8. Hakların (KVKK m.11)</h2>
      <ul>
        <li>Kişisel verinin işlenip işlenmediğini öğrenme ve bilgi talep etme,</li>
        <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme,</li>
        <li>Aktarıldığı üçüncü kişileri bilme,</li>
        <li>Eksik veya yanlış işlenmişse düzeltilmesini, silinmesini veya yok edilmesini isteme,</li>
        <li>Otomatik sistemlerle analiz sonucu aleyhine bir sonuç çıkmasına itiraz etme,</li>
        <li>Kanuna aykırı işleme nedeniyle zarara uğraman halinde zararın giderilmesini talep etme.</li>
      </ul>
      <p>
        Hesabını ve tüm verilerini profil sayfasından kendin silebilirsin. Diğer talepler için: <Contact />.
      </p>
    </LegalPage>
  );
}
