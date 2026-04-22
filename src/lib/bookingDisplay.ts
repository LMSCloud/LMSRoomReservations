import { t } from "./translate";

export type RoomOption = { id: number | string; name: string };
export type EquipmentOption = { id: number | string; name: string; roomid?: number | string };
export type BorrowerLike = {
    firstname?: string | null;
    surname?: string | null;
    cardnumber?: string | null;
};

export function findRoomName(rooms: RoomOption[], roomid: unknown): string {
    return rooms.find((r) => r.id == roomid)?.name ?? String(roomid ?? "");
}

export function composePatronName(borrower?: BorrowerLike): string {
    if (!borrower) return t("Unknown");
    const name = [borrower.firstname, borrower.surname].filter(Boolean).join(" ");
    return name || t("Unknown");
}

export function patronDisplay(borrower: BorrowerLike | undefined, fallback: string | number): string {
    if (!borrower) return String(fallback);
    const name = composePatronName(borrower);
    return borrower.cardnumber ? `${name} (${borrower.cardnumber})` : name;
}

export function listEquipmentNames(
    equipment: EquipmentOption[],
    items: Array<{ equipmentid: number | string }>,
): string {
    return items.map((item) => equipment.find((e) => e.id === item.equipmentid)?.name ?? t("Unknown")).join(", ");
}

export function extractEquipmentItems(tuple: unknown): Array<{ equipmentid: number | string }> {
    if (!Array.isArray(tuple)) return [];
    const items = tuple[1];
    return Array.isArray(items) ? items : [];
}
