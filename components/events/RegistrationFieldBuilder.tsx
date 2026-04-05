"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent 
} from "@dnd-kit/core";
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy, 
    useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
    GripVertical, 
    Trash2, 
    Plus, 
    Type, 
    Hash, 
    CheckSquare, 
    Mail, 
    Calendar as CalendarIcon,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export type FieldType = "text" | "number" | "boolean" | "email" | "date";

export type RegistrationField = {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
};

interface RegistrationFieldBuilderProps {
    initialFields?: RegistrationField[];
    onChange: (fields: RegistrationField[]) => void;
}

export default function RegistrationFieldBuilder({ initialFields = [], onChange }: RegistrationFieldBuilderProps) {
    const [fields, setFields] = useState<RegistrationField[]>(initialFields);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over?.id);
                const newArr = arrayMove(items, oldIndex, newIndex);
                onChange(newArr);
                return newArr;
            });
        }
    };

    const addField = () => {
        const id = Math.random().toString(36).substring(7);
        const newField: RegistrationField = {
            id,
            name: `field_${id}`,
            label: "New Field",
            type: "text",
            required: false,
        };
        const newFields = [...fields, newField];
        setFields(newFields);
        onChange(newFields);
    };

    const removeField = (id: string) => {
        const newFields = fields.filter((f) => f.id !== id);
        setFields(newFields);
        onChange(newFields);
    };

    const updateField = (id: string, updates: Partial<RegistrationField>) => {
        const newFields = fields.map((f) => (f.id === id ? { ...f, ...updates } : f));
        setFields(newFields);
        onChange(newFields);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Custom Registration Fields</h3>
                <button
                    type="button"
                    onClick={addField}
                    className="text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 active:scale-95"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Field
                </button>
            </div>

            {fields.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center bg-muted/30">
                    <p className="text-sm text-muted-foreground mb-3">No custom fields added yet.</p>
                    <button
                        type="button"
                        onClick={addField}
                        className="text-sm font-semibold bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                    >
                        Start Adding Fields
                    </button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={fields.map(f => f.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {fields.map((field) => (
                                <SortableFieldItem
                                    key={field.id}
                                    field={field}
                                    onUpdate={(updates) => updateField(field.id, updates)}
                                    onRemove={() => removeField(field.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    );
}

function SortableFieldItem({ field, onUpdate, onRemove }: { 
    field: RegistrationField; 
    onUpdate: (updates: Partial<RegistrationField>) => void;
    onRemove: () => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
    };

    const typeIcons: Record<FieldType, any> = {
        text: Type,
        number: Hash,
        boolean: CheckSquare,
        email: Mail,
        date: CalendarIcon,
    };

    const Icon = typeIcons[field.type] || Type;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative bg-card border border-border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all",
                isDragging ? "shadow-2xl ring-2 ring-primary/20 bg-primary/5 opacity-80" : ""
            )}
        >
            <div className="flex gap-4 items-start">
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="mt-2.5 cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded-md transition-colors"
                >
                    <GripVertical className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                    {/* Label Input */}
                    <div className="md:col-span-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1 ml-1 block">Label</label>
                        <input
                            type="text"
                            value={field.label}
                            onChange={(e) => {
                                const val = e.target.value;
                                onUpdate({ 
                                    label: val,
                                    name: val.toLowerCase().replace(/[^a-z0-9]/g, "_") || field.id
                                });
                            }}
                            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-medium"
                            placeholder="Field Label (e.g. Department)"
                        />
                    </div>

                    {/* Type Select */}
                    <div className="md:col-span-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1 ml-1 block">Type</label>
                        <div className="relative group/type">
                            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within/type:text-primary transition-colors" />
                            <select
                                value={field.type}
                                onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
                                className="w-full bg-background border border-border rounded-xl pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="text">Text Input</option>
                                <option value="number">Number</option>
                                <option value="email">Email</option>
                                <option value="date">Date Picker</option>
                                <option value="boolean">Checkbox / Toggle</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        </div>
                    </div>

                    {/* Checkbox for Required */}
                    <div className="md:col-span-3 flex items-end h-full pt-1 md:pt-4">
                         <label className="flex items-center gap-2.5 cursor-pointer select-none py-2 px-3 hover:bg-muted/50 rounded-xl transition-colors">
                            <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => onUpdate({ required: e.target.checked })}
                                className="w-4.5 h-4.5 rounded text-primary focus:ring-primary border-border bg-background cursor-pointer"
                            />
                            <span className="text-xs font-semibold text-foreground/80 lowercase italic">Required?</span>
                        </label>
                    </div>

                    {/* Delete Button */}
                    <div className="md:col-span-2 flex justify-end pt-1 md:pt-4">
                        <button
                            type="button"
                            onClick={onRemove}
                            className="p-2.5 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                            title="Remove field"
                        >
                            <Trash2 className="w-4.5 h-4.5" />
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Field Name Helper (Preview) */}
            <div className="mt-2 ml-10 flex items-center gap-2 overflow-hidden">
                <span className="text-[10px] font-mono text-muted-foreground/40 shrink-0">Field Name:</span>
                <span className="text-[10px] font-mono text-muted-foreground/60 truncate bg-muted/50 px-1.5 py-0.5 rounded italic">{field.name}</span>
            </div>
        </div>
    );
}
