import { Extension } from "@tiptap/core";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addStorage() {
    return {
      showMenu: false,
      position: { top: 0, left: 0 },
    };
  },

  addKeyboardShortcuts() {
    return {
      "/": ({ editor }) => {
        console.log("Slash `/` key pressed! ✅");

        const text = editor.getText();
        if (text.endsWith("/")) {
          const pos = editor.view.coordsAtPos(editor.state.selection.from);
          editor.storage.slashCommand.showMenu = true;
          editor.storage.slashCommand.position = pos;
          return true;
        }
        return false;
      },

      Enter: ({ editor }) => {
        if (editor.storage.slashCommand.showMenu) {
          editor.commands.deleteRange({
            from: editor.state.selection.from - 1,
            to: editor.state.selection.from,
          });
          editor.storage.slashCommand.showMenu = false;
          return true;
        }
      },

      Escape: ({ editor }) => {
        editor.storage.slashCommand.showMenu = false;
      },
    };
  },
});
