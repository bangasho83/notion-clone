import { Extension } from "@tiptap/core";

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addStorage() {
    return {
      showMenu: false,
      position: { top: 0, left: 0 },
      selectedIndex: 0,
      commands: [],
    };
  },

  addKeyboardShortcuts() {
    return {
      "/": ({ editor }) => {
        // Show the menu and capture the position
        const selection = editor.state.selection;
        const pos = editor.view.coordsAtPos(selection.from);
        editor.storage.slashCommand.showMenu = true;
        editor.storage.slashCommand.position = pos;
        editor.storage.slashCommand.selectedIndex = 0;

        // Store the command list for consistent ordering
        editor.storage.slashCommand.commands = getAvailableCommands();

        // Let the slash actually appear in the document
        return false;
      },

      ArrowDown: ({ editor }) => {
        if (editor.storage.slashCommand.showMenu) {
          const cmds = editor.storage.slashCommand.commands;
          const currentIndex = editor.storage.slashCommand.selectedIndex;
          editor.storage.slashCommand.selectedIndex = (currentIndex + 1) % cmds.length;
          return true;
        }
      },

      ArrowUp: ({ editor }) => {
        if (editor.storage.slashCommand.showMenu) {
          const cmds = editor.storage.slashCommand.commands;
          const currentIndex = editor.storage.slashCommand.selectedIndex;
          editor.storage.slashCommand.selectedIndex =
            (currentIndex - 1 + cmds.length) % cmds.length;
          return true;
        }
      },

      Enter: ({ editor }) => {
        if (editor.storage.slashCommand.showMenu) {
          const { selection } = editor.state;
          const from = selection.from;
          // Check that the slash is still there before the cursor
          const charBefore = editor.state.doc.textBetween(from - 1, from);
          if (charBefore !== "/") {
            editor.storage.slashCommand.showMenu = false;
            return false;
          }

          // Grab the correct command from the stored list
          const cmds = editor.storage.slashCommand.commands;
          const selectedIndex = editor.storage.slashCommand.selectedIndex;
          const commandToRun = cmds[selectedIndex];

          // Delete the slash then run the command
          if (commandToRun) {
            editor.commands.deleteRange({ from: from - 1, to: from });
            setTimeout(() => {
              commandToRun.action(editor);
            }, 0);
          }

          // Close the menu
          editor.storage.slashCommand.showMenu = false;
          return true;
        }
        return false;
      },

      Escape: ({ editor }) => {
        editor.storage.slashCommand.showMenu = false;
        return true;
      },
    };
  },
});

function getAvailableCommands() {
  return [
    {
      name: "Heading 1",
      action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      name: "Heading 2",
      action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      name: "Bold",
      // Wrap in a setTimeout so that focus is maintained when triggered via mouse
      action: (editor) =>
        setTimeout(() => {
          editor.chain().focus().toggleBold().run();
        }, 0),
    },
    {
      name: "Italic",
      action: (editor) =>
        setTimeout(() => {
          editor.chain().focus().toggleItalic().run();
        }, 0),
    },
    {
      name: "Bullet List",
      action: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      name: "Numbered List",
      action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
  ];
}
