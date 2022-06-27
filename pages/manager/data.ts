export function RecordToForm(formData: FormData, prefix: string, data: (Record<string, string | undefined> & { id: string; })[]) {
    data.forEach(entry => {
        formData.append(prefix, entry.id);
        for (const [ key, value ] of Object.entries(entry)) {
            if (key == "id") continue;
            if (value)
                formData.set(`${prefix}-${entry.id}-${key}`, value);
        }
    });

    return formData;
}
// deno-lint-ignore no-explicit-any
export function DeleteFromForm(fromData: FormData, prefix: string, filter: (data: any) => boolean) {
    const filtered = fromData.getAll(prefix).filter(filter);
    fromData.delete(prefix);
    for (const iterator of filtered) {
        fromData.append(prefix, iterator);
    }
    if (filtered.length === 0)
        fromData.set(prefix, "");
}
export function FormToRecord<list extends string>(formData: FormData, prefix: string, finder: list[]): ({ id: string; } & { [ type in list ]: string })[] {
    const idlist = formData.getAll(prefix);
    const list = [];
    for (const id of idlist.filter(x => x)) {
        const entry: Record<string, string> & { id: string; } = { id: id.toString() };
        for (const key of finder) {
            if (formData.has(`${prefix}-${id}-${key}`))
                // @ts-ignore Its fine
                entry[ key ] = formData.get(`${prefix}-${id}-${key}`);

        }
        list.push(entry);
    }
    // deno-lint-ignore no-explicit-any
    return list as any;
}