import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Search } from "lucide-react"

type Vendor = {
  vendorCode: string
  vendorName: string
}

const mockVendors: Vendor[] = [
  { vendorCode: "V0001", vendorName: "ABC TEKNOLOJİ A.Ş." },
  { vendorCode: "V0002", vendorName: "XYZ ENDÜSTRİ LTD. ŞTİ." },
  { vendorCode: "V0003", vendorName: "METAL SANAYİ VE TİCARET A.Ş." },
  { vendorCode: "V0004", vendorName: "ELEKTRİK MALZ. TİC. LTD. ŞTİ." },
  { vendorCode: "V0005", vendorName: "MAKİNE İMALAT SAN. A.Ş." },
  { vendorCode: "V0006", vendorName: "KAUÇUK VE PLASTİK A.Ş." },
  { vendorCode: "V0007", vendorName: "OTOMOTİV YAN SANAYİ LTD. ŞTİ." },
  { vendorCode: "V0008", vendorName: "KİMYA SANAYİ A.Ş." },
  { vendorCode: "V0009", vendorName: "İNŞAAT MALZEMELERİ TİC. LTD. ŞTİ." },
  { vendorCode: "V0010", vendorName: "TEKSTİL VE KONFEKS. A.Ş." },
  { vendorCode: "V0011", vendorName: "GIDA SANAYİ LTD. ŞTİ." },
  { vendorCode: "V0012", vendorName: "AMBALAJ SANAYİ A.Ş." },
  { vendorCode: "V0013", vendorName: "BOYA VE KİMYA TİC. LTD. ŞTİ." },
  { vendorCode: "V0014", vendorName: "HIRDAVAT VE NAL. TİC. A.Ş." },
  { vendorCode: "V0015", vendorName: "ELEKTRONİK SİSTEMLER LTD. ŞTİ." },
]

interface VendorSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onVendorSelected: (vendor: Vendor) => void
}

export default function VendorSelectionDialog({ open, onOpenChange, onVendorSelected }: VendorSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVendors = useMemo(() => {
    return mockVendors.filter(
      (vendor) =>
        vendor.vendorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleSelect = (vendor: Vendor) => {
    onVendorSelected(vendor)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Satıcı Seçimi</DialogTitle>
          <DialogDescription>Talep için bir satıcı/muhatap seçin</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Input
            placeholder="Muhatap kodu veya adına göre ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead className="w-[200px]">Muhatap Kodu</TableHead>
                <TableHead>Muhatap Adı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.vendorCode} onClick={() => handleSelect(vendor)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{vendor.vendorCode}</TableCell>
                  <TableCell>{vendor.vendorName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Kapat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
