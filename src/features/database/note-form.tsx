import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";

// TODO: sector should be a combobox with all the sectors in the database plus option for custom sector
// TODO: eventType should be a combobox with all the event types in the database plus option for custom event type (multi tags options)
// TODO: call the dropdowns values from the database ( secotrs, events )
// TODO: fix icons UI for date/time
export function NoteForm({ initialValues, onSubmit, submitLabel = "Save" }: NoteFormProps) {
    const form = useForm({
        defaultValues: initialValues,
    });

    const handleSubmit = (data: any) => {
        onSubmit?.(data);
    };

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div>
                <label htmlFor="description" className="block text-sm font-medium">
                    Description
                </label>
                <Textarea
                    id="description"
                    {...form.register("description")}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium">
                        Date
                    </label>
                    <Input
                        id="date"
                        type="date"
                        {...form.register("date")}
                    />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium">
                        Time
                    </label>
                    <Input
                        id="time"
                        type="time"
                        {...form.register("time")}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Event Type
                </label>
                <div className="space-y-2">
                    {["Meeting", "Call", "Email", "Task"].map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                                id={`eventType-${type}`}
                                {...form.register("eventType")}
                                value={type}
                            />
                            <label htmlFor={`eventType-${type}`} className="text-sm">
                                {type}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <label htmlFor="sector" className="block text-sm font-medium">
                    Sector
                </label>
                <Select onValueChange={(value) => form.setValue("sector", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium">
                    Location
                </label>
                <Input
                    id="location"
                    {...form.register("location")}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lat" className="block text-sm font-medium">
                        Latitude
                    </label>
                    <Input
                        id="lat"
                        type="number"
                        step="any"
                        {...form.register("lat", { valueAsNumber: true })}
                    />
                </div>
                <div>
                    <label htmlFor="lng" className="block text-sm font-medium">
                        Longitude
                    </label>
                    <Input
                        id="lng"
                        type="number"
                        step="any"
                        {...form.register("lng", { valueAsNumber: true })}
                    />
                </div>
            </div>

            <Button type="submit">
                {submitLabel}
            </Button>
        </form>
    );
}

interface NoteFormProps {
    initialValues?: {
        description: string;
        date: string | undefined;
        time: string | undefined;
        eventType: string[] | undefined;
        sector: string | undefined;
        location: string | undefined;
        lat: number | undefined;
        lng: number | undefined;
    };
    onSubmit?: (data: any) => void;
    submitLabel?: string;
}