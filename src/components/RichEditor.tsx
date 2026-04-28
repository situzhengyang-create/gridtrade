import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered
} from 'lucide-react';
import React from 'react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rightToolbar?: React.ReactNode;
}

const MenuBar = ({ editor, rightToolbar }: { editor: any, rightToolbar?: React.ReactNode }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 px-3 border-b border-slate-100 bg-slate-50/50 sticky top-0 z-10 transition-colors group-focus-within:bg-white group-focus-within:border-blue-100">
      <div className="flex items-center border-r border-slate-200 pr-1.5 mr-0.5 gap-0.5">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-all ${editor.isActive('bold') ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
          title="加粗"
        >
          <Bold size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-all ${editor.isActive('italic') ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
          title="斜体"
        >
          <Italic size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-all ${editor.isActive('underline') ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
          title="下划线"
        >
          <UnderlineIcon size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-all ${editor.isActive('strike') ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
          title="删除线"
        >
          <Strikethrough size={15} />
        </button>
      </div>

      <div className="flex items-center gap-0.5">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-all ${editor.isActive('bulletList') ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
          title="无序列表"
        >
          <List size={15} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md hover:bg-slate-200/50 transition-all ${editor.isActive('orderedList') ? 'bg-slate-200 text-slate-900' : 'text-slate-500'}`}
          title="有序列表"
        >
          <ListOrdered size={15} />
        </button>
      </div>

      {rightToolbar && (
        <div className="ml-auto flex items-center">
          {rightToolbar}
        </div>
      )}
    </div>
  );
};

export default function RichEditor({ value, onChange, placeholder, rightToolbar }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-500 cursor-pointer transition-all',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose text-[14px] focus:outline-none p-5 sm:p-6 min-h-[inherit] max-w-none text-slate-800 prose-slate prose-a:font-medium [&_ul]:list-disc [&_ol]:list-decimal [&_li]:my-0.5 [&_p]:my-2 leading-relaxed',
      },
    },
  });

  // 当外部 value 改变时更新内部内容（仅在内容不同步时）
  React.useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col h-full bg-white group focus-within:ring-1 focus-within:ring-blue-100 transition-all">
      <MenuBar editor={editor} rightToolbar={rightToolbar} />
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
