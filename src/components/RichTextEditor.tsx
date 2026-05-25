import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useId, useRef, useState } from 'react';
import { uploadPicture, validatePictureFile } from '@/api/uploads';
import { isEmptyRichText } from '@/lib/rich-text';

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  'aria-invalid'?: boolean;
}

interface ToolbarButtonProps {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

const ToolbarButton = ({ label, active, disabled, onClick }: ToolbarButtonProps) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={`min-h-9 min-w-9 rounded-md border px-2 text-sm font-semibold transition ${
      active
        ? 'border-slate-900 bg-slate-900 text-white'
        : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
    } disabled:cursor-not-allowed disabled:opacity-60`}
  >
    {label}
  </button>
);

export const RichTextEditor = ({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  'aria-invalid': ariaInvalid,
}: RichTextEditorProps) => {
  const fallbackId = useId();
  const editorId = id ?? fallbackId;
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      const html = currentEditor.getHTML();
      onChange(isEmptyRichText(html) ? '' : html);
    },
    onBlur: () => {
      onBlur?.();
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = value || '';
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  const runCommand = (command: () => boolean) => {
    if (!editor || disabled) {
      return;
    }
    command();
    editor.commands.focus();
  };

  const handleImageSelected = async (files: FileList | null) => {
    if (!editor || !files || files.length === 0) {
      return;
    }

    const file = files[0];
    const validationError = validatePictureFile(file);
    if (validationError) {
      setImageError(validationError);
      return;
    }

    setImageError(null);
    setUploadingImage(true);
    try {
      const publicUrl = await uploadPicture(file);
      editor.chain().focus().setImage({ src: publicUrl, alt: file.name }).run();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed';
      setImageError(message);
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="rich-text-editor">
      <div
        role="toolbar"
        aria-label="Description formatting"
        className="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-slate-300 bg-slate-50 p-2"
      >
        <ToolbarButton
          label="Bold"
          active={editor?.isActive('bold')}
          disabled={disabled || !editor}
          onClick={() => runCommand(() => editor?.chain().focus().toggleBold().run() ?? false)}
        />
        <ToolbarButton
          label="Italic"
          active={editor?.isActive('italic')}
          disabled={disabled || !editor}
          onClick={() => runCommand(() => editor?.chain().focus().toggleItalic().run() ?? false)}
        />
        <ToolbarButton
          label="Underline"
          active={editor?.isActive('underline')}
          disabled={disabled || !editor}
          onClick={() => runCommand(() => editor?.chain().focus().toggleUnderline().run() ?? false)}
        />
        <ToolbarButton
          label="Strikethrough"
          active={editor?.isActive('strike')}
          disabled={disabled || !editor}
          onClick={() => runCommand(() => editor?.chain().focus().toggleStrike().run() ?? false)}
        />
        <ToolbarButton
          label="Bullet list"
          active={editor?.isActive('bulletList')}
          disabled={disabled || !editor}
          onClick={() => runCommand(() => editor?.chain().focus().toggleBulletList().run() ?? false)}
        />
        <ToolbarButton
          label="Numbered list"
          active={editor?.isActive('orderedList')}
          disabled={disabled || !editor}
          onClick={() => runCommand(() => editor?.chain().focus().toggleOrderedList().run() ?? false)}
        />
        <ToolbarButton
          label="Image"
          disabled={disabled || !editor || uploadingImage}
          onClick={() => imageInputRef.current?.click()}
        />
      </div>

      <EditorContent
        id={editorId}
        editor={editor}
        aria-invalid={ariaInvalid}
        className="rich-text-editor__content input min-h-[10rem] rounded-t-none py-3"
      />

      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        aria-label="Insert inline image"
        onChange={(event) => void handleImageSelected(event.target.files)}
      />

      <p className="help">
        Use Enter for a new paragraph and Shift+Enter for a line break. Inline images must be JPEG,
        PNG, WebP, or GIF up to 5 MB.
      </p>
      {imageError ? <p className="error-text">{imageError}</p> : null}
      {uploadingImage ? <p className="help">Uploading image…</p> : null}
    </div>
  );
};
