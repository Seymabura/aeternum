import { test, expect } from "vitest";
import { lanternProblem } from "../lib/lantern-filter";
test("filtre", () => {
  for (const ok of ["Sıkıntılarım bitsin", "Sağlık", "Ankara'ya taşınayım", "Siklus... yok", "Göttingen'e gideyim", "amcam iyileşsin", "Malatya'ya gideceğiz", "piçi-kurusu değil"]) expect(lanternProblem(ok), ok).toBeNull();
  for (const bad of ["siktir git", "AMK", "www.site.com", "beni ara 0532 123 45 67", "@kullanici takip", "orospu", "göt"]) expect(lanternProblem(bad), bad).not.toBeNull();
});
