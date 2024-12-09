"use client";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { fs } from "../utils/firebaseConfig";
import React, { useEffect, useState } from "react";

interface Table {
  tableNumber: number;
  status: string;
}

const TablePage = () => {
  const router = useRouter();
  const [tableOccupied, setTableOccupied] = useState<Table[]>([]);
  const [method, setMethod] = useState<string>("");

  useEffect(() => {
    const storedMethod = localStorage.getItem("method");
    setMethod(storedMethod || "takeout");

    const fetchTables = async () => {
      const tablesCollection = collection(fs, "tables");
      const q = query(tablesCollection, where("status", "==", "occupied")); // Only fetch occupied tables
      onSnapshot(q, (snapshot) => {
        const tables = snapshot.docs.map((doc) => doc.data() as Table);
        setTableOccupied(tables);
      });
    };

    fetchTables();
  }, []);

  const handleTable = (tableNumber: number) => {
    localStorage.setItem("tableNumber", tableNumber.toString());
    router.push("/category");
  };

  const isAllOccupied = tableOccupied.length >= 25; // Check if all 25 tables are occupied

  return (
    <div className="py-10 mx-auto container px-40">
      <div className="text-center">
        <h1 className="font-bold text-4xl text-black/70">
          {method === "dine in"
            ? "Which table are you seated?"
            : "Select Take Out"}
        </h1>
        <div className="grid grid-cols-5 gap-5 mt-16 text-2xl font-bold">
          {method === "takeout" ? (
            <button
              onClick={() => handleTable(0)}
              className="p-2 h-40 content-center rounded-xl bg-foreground/10 text-foreground hover:bg-foreground hover:text-white"
            >
              <p>Not seated</p>
            </button>
          ) : (
            <>
              {isAllOccupied && (
                <button
                  onClick={() => handleTable(0)}
                  className="p-2 h-40 content-center rounded-xl bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  Another table
                </button>
              )}
              {Array.from({ length: 25 }, (_, i) =>
                tableOccupied.some(
                  (table: Table) => table.tableNumber === i + 1
                ) ? (
                  <p
                    key={i}
                    className="p-2 rounded-xl bg-foreground text-white h-40 content-center cursor-not-allowed"
                  >
                    Table {i + 1}: OCCUPIED
                  </p>
                ) : (
                  <button
                    key={i}
                    onClick={() => handleTable(i + 1)}
                    className="p-2 h-40 content-center rounded-xl bg-foreground/10 text-foreground hover:bg-foreground hover:text-white"
                  >
                    {`Table ${i + 1}`}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePage;
