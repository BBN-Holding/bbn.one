
export function deleteFileDialog() {
    const response = Promise.withResolvers<boolean>();
    // Dialog(() => Box(Label("Deleting this File will result in data loss.\nAfter this point there is no going back.")).setMargin("0 0 1.5rem"))
    //     .setTitle("Are you sure?")
    //     .addButton("Cancel", "remove")
    //     .addButton("Delete", () => {
    //         response.resolve(true);
    //         return "remove" as const;
    //     }, Color.Critical)
    //     .onClose(() => response.resolve(false))
    //     .allowUserClose()
    //     .open();

    return response.promise;
}
