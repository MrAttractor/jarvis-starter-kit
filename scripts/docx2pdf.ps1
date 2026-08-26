# Convertit des .docx en .pdf avec Word, sans ouvrir de fenetre.
#
# Usage :
#   powershell -NoProfile -ExecutionPolicy Bypass -File scripts\docx2pdf.ps1 `
#       -Dossier "C:\chemin\du\dossier" [-Fichiers "01-Un.docx","02-Deux.docx"]
#
# Sans -Fichiers, tous les .docx du dossier sont convertis.
# Le PDF est ecrit a cote du .docx, meme nom.

param(
    [Parameter(Mandatory = $true)][string]$Dossier,
    [string[]]$Fichiers
)

if (-not (Test-Path $Dossier)) { throw "dossier introuvable : $Dossier" }

if ($Fichiers) {
    # Appele avec -File, PowerShell ne decoupe pas une liste separee par des
    # virgules : on le fait ici, sinon "a.docx,b.docx" est cherche tel quel.
    $noms = $Fichiers -split ',' | Where-Object { $_ -ne '' }
    $cibles = $noms | ForEach-Object { Get-Item (Join-Path $Dossier $_.Trim()) }
} else {
    $cibles = Get-ChildItem "$Dossier\*.docx" | Sort-Object Name
}

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    foreach ($f in $cibles) {
        $pdf = [System.IO.Path]::ChangeExtension($f.FullName, '.pdf')
        $doc = $word.Documents.Open($f.FullName, $false, $true)
        # 17 = wdExportFormatPDF
        $doc.ExportAsFixedFormat($pdf, 17)
        $pages = $doc.ComputeStatistics(2)
        $doc.Close(0)
        "{0,-46} {1,2} pages" -f ([System.IO.Path]::GetFileName($pdf)), $pages
    }
} finally {
    $word.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
}
