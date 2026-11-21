export function SetupNotice() {
  return (
    <main className="mx-auto max-w-lg px-6 py-24 text-center">
      <h1 className="display text-3xl">Neredeyse hazır</h1>
      <p className="mt-4 text-ink-soft">
        Veritabanı bağlantısı henüz ayarlanmadı. <code>.env.local</code> dosyasına Supabase adresi ve anahtarı eklenince
        Aeternum açılacak.
      </p>
    </main>
  );
}
