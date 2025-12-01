import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

function Settings() {
  return (
    <Button size={'icon'} variant={'secondary'}>
        <Menu size={30}/>
    </Button>
  )
}

export default Settings