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

type Item = {
  itemCode: string
  itemName: string
}

const mockItems: Item[] = [
  { itemCode: "DUMMY", itemName: "🔸 BİLİNMEYEN KALEM (Dummy Kalem - Detaylar açıklamada belirtilecek)" },
  { itemCode: "05.13.E05.02.127.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 1/2\" x 0.71 mm BY 50 MT" },
  { itemCode: "05.13.E05.02.147.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 3/4\" x 0.71 mm BY 50 MT" },
  { itemCode: "05.13.E05.02.349.0.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 3/4\" x 0.89 mm BY 50 MT" },
  { itemCode: "05.13.E05.02.387.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 3/8\" x 0.71 mm BY 50 MT" },
  { itemCode: "05.13.E05.02.389.0.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 5/8\" x 0.89 mm BY 50 MT" },
  { itemCode: "05.13.E05.08.126.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK VRV 1/2\" x 0.55 mm BY 50 MT" },
  { itemCode: "05.13.E05.08.145.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK VRV 1/4\" x 0.55 mm BY 50 MT" },
  { itemCode: "05.13.E05.08.386.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK VRV 3/8\" x 0.61 mm BY 50 MT" },
  { itemCode: "05.13.E94.08.126.1.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 1/2\" x 0.61 mm BY 50 MT" },
  { itemCode: "05.13.E94.08.145.5.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 1/4\" x 0.55 mm BY 50 MT" },
  { itemCode: "05.13.E94.08.348.1.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 3/4\" x 0.61 mm BY 50 MT" },
  { itemCode: "05.13.E94.08.385.5.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 3/8\" x 0.55 mm BY 50 MT" },
  { itemCode: "05.13.E94.08.386.1.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 3/8\" x 0.61 mm BY 50 MT" },
  { itemCode: "06.033.02.127.1.0.01V.I.25M", itemName: "6 mm QTHERM V-ECO MAKS 1/2\" x 0.71 mm BY QUI BEJ-AZ 50 MT" },
  { itemCode: "06.033.02.127.1.0.01V.I.50M", itemName: "6 mm QTHERM V-ECO MAKS 1/2\" x 0.71 mm BY QUI BEJ-AZ 50 MT" },
]

interface ItemSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemSelected: (item: Item) => void
}

export default function ItemSelectionDialog({ open, onOpenChange, onItemSelected }: ItemSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = useMemo(() => {
    return mockItems.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  const handleSelect = (item: Item) => {
    onItemSelected(item)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kalem Seçimi</DialogTitle>
          <DialogDescription>Talebe eklemek için bir kalem seçin</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Input
            placeholder="Kalem kodu veya tanımına göre ara..."
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
                <TableHead className="w-[300px]">Kalem Kodu</TableHead>
                <TableHead>Kalem Tanımı</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.itemCode} onClick={() => handleSelect(item)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
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
