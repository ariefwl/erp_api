export function formatPeriode(periode) {
  const year = periode.toString().substring(0, 4);
  const month = periode.toString().substring(4, 6);

  const bulanIndo = [
    "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return `${bulanIndo[parseInt(month)]} ${year}`;
}


// Format Rupiah: 1500000 → Rp 1.500.000
export function formatRupiah(value) {
  if (!value) return "Rp 0";
  return "Rp " + Number(value).toLocaleString("id-ID");
}


// Format date: 2024-01-05 → 05 Januari 2024
export function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const date = new Date(tanggal);

  const bulanIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const day = date.getDate().toString().padStart(2, "0");
  const month = bulanIndo[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}


// Format tanggal pendek: 2024-01-05 → 05/01/2024
export function formatTanggalShort(tanggal) {
  if (!tanggal) return "-";
  const date = new Date(tanggal);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}