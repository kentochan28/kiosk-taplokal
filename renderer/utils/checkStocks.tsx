import { doc, getDoc } from "firebase/firestore"
import { fs } from "./firebaseConfig"

const getStock = async (menuId: string) => {
    const stockRef = doc(fs, 'menu', menuId)
    const stockDoc = await getDoc(stockRef)
    const stockData = stockDoc.data()
    return stockData ? stockData.stock : null
}

export default getStock