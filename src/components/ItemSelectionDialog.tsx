import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
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
import { Search, ArrowUpDown } from "lucide-react"

type Item = {
  itemCode: string
  itemName: string
  stock: number
}

const mockItems: Item[] = [
  { itemCode: "DUMMY", itemName: "🔸 BİLİNMEYEN KALEM (Dummy Kalem - Detaylar açıklamada belirtilecek)", stock: 999 },
  { itemCode: "05.13.E05.02.127.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 1/2\" x 0.71 mm BY 50 MT", stock: 0 },
  { itemCode: "05.13.E05.02.147.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 3/4\" x 0.71 mm BY 50 MT", stock: 120 },
  { itemCode: "05.13.E05.02.349.0.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 3/4\" x 0.89 mm BY 50 MT", stock: 50 },
  { itemCode: "05.13.E05.02.387.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 3/8\" x 0.71 mm BY 50 MT", stock: 0 },
  { itemCode: "05.13.E05.02.389.0.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK MAKS 5/8\" x 0.89 mm BY 50 MT", stock: 25 },
  { itemCode: "05.13.E05.08.126.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK VRV 1/2\" x 0.55 mm BY 50 MT", stock: 300 },
  { itemCode: "05.13.E05.08.145.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK VRV 1/4\" x 0.55 mm BY 50 MT", stock: 0 },
  { itemCode: "05.13.E05.08.386.1.0.B9.50N", itemName: "9 mm OTTOCOOL KAUÇUK VRV 3/8\" x 0.61 mm BY 50 MT", stock: 15 },
  { itemCode: "05.13.E94.08.126.1.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 1/2\" x 0.61 mm BY 50 MT", stock: 88 },
  { itemCode: "05.13.E94.08.145.5.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 1/4\" x 0.55 mm BY 50 MT", stock: 0 },
  { itemCode: "05.13.E94.08.348.1.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 3/4\" x 0.61 mm BY 50 MT", stock: 42 },
  { itemCode: "05.13.E94.08.385.5.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 3/8\" x 0.55 mm BY 50 MT", stock: 0 },
  { itemCode: "05.13.E94.08.386.1.0.B9.50N", itemName: "13 mm LEEDS PIPE KAUÇUK VRV 3/8\" x 0.61 mm BY 50 MT", stock: 10 },
  { itemCode: "06.033.02.127.1.0.01V.I.25M", itemName: "6 mm QTHERM V-ECO MAKS 1/2\" x 0.71 mm BY QUI BEJ-AZ 50 MT", stock: 1500 },
  { itemCode: "06.033.02.127.1.0.01V.I.50M", itemName: "6 mm QTHERM V-ECO MAKS 1/2\" x 0.71 mm BY QUI BEJ-AZ 50 MT", stock: 750 },
]

type SortDirection = "asc" | "desc" | null

interface ItemSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemSelected: (item: Item) => void
}

export default function ItemSelectionDialog({ open, onOpenChange, onItemSelected }: ItemSelectionDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  const filteredItems = useMemo(() => {
    let items = mockItems.filter(
      (item) =>
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (sortDirection) {
      items.sort((a, b) => {
        if (sortDirection === "asc") {
          return a.stock - b.stock
        } else {
          return b.stock - a.stock
        }
      })
    }

    return items
  }, [searchQuery, sortDirection])

  const handleSort = () => {
    if (sortDirection === "asc") {
      setSortDirection("desc")
    } else if (sortDirection === "desc") {
      setSortDirection(null)
    } else {
      setSortDirection("asc")
    }
  }

  const handleSelect = (item: Item) => {
    onItemSelected(item)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kalem Seçimi</DialogTitle>
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
                <TableHead className="w-[150px] cursor-pointer text-right" onClick={handleSort}>
                  <div className="flex items-center justify-end gap-2">
                    Stok
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.itemCode} onClick={() => handleSelect(item)} className="cursor-pointer">
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell className="text-right">{item.stock}</TableCell>
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
