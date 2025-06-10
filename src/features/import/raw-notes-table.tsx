import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { TempRawNote } from "./types";
import { Button } from "~/components/ui/button";

export function RawNotesTable({ rawNotes, saveNotes }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Processed Input</CardTitle>
        <p className="text-muted-foreground text-sm">
          The following notes are temporary, if you like the result you MUST
          save them. Beware that reprocessing and saving again, will create
          duplicates.
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="bg-muted h-[300px] rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rawNotes.length > 0 ? (
                rawNotes.map((note, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{index}</TableCell>
                    <TableCell className="max-w-[400px] truncate">
                      {note.value}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No processed notes yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={saveNotes}>Save</Button>
      </CardFooter>
    </Card>
  );
}

interface Props {
  rawNotes: TempRawNote[];
  saveNotes: () => void;
}
