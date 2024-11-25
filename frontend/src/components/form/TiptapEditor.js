import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import './TiptapEditor.css';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-menu-bar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
      >
        h1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        h2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        h3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        bullet list
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        ordered list
      </button>
    </div>
  );
};

const convertTiptapToStrapi = (tiptapJson) => {
  if (!tiptapJson?.content?.length) {
    return [{
      type: 'paragraph',
      children: [{ type: 'text', text: '' }]
    }];
  }

  return tiptapJson.content.map(node => {
    if (node.type === 'heading') {
      return {
        type: 'heading',
        level: node.attrs.level,
        children: (node.content || []).map(child => ({
          type: 'text',
          text: child.text || '',
          bold: child.marks?.some(mark => mark.type === 'bold') || false,
          italic: child.marks?.some(mark => mark.type === 'italic') || false,
        }))
      };
    }

    if (node.type === 'paragraph') {
      return {
        type: 'paragraph',
        children: (node.content || []).map(child => ({
          type: 'text',
          text: child.text || '',
          bold: child.marks?.some(mark => mark.type === 'bold') || false,
          italic: child.marks?.some(mark => mark.type === 'italic') || false,
        }))
      };
    }

    if (node.type === 'bulletList' || node.type === 'orderedList') {
      return {
        type: 'list',
        format: node.type === 'orderedList' ? 'ordered' : 'unordered',
        children: (node.content || []).map(listItem => ({
          type: 'listItem',
          children: (listItem.content || []).map(paragraph => ({
            type: 'paragraph',
            children: (paragraph.content || []).map(child => ({
              type: 'text',
              text: child.text || '',
              bold: child.marks?.some(mark => mark.type === 'bold') || false,
              italic: child.marks?.some(mark => mark.type === 'italic') || false,
            }))
          }))
        }))
      };
    }

    return {
      type: 'paragraph',
      children: [{ type: 'text', text: '' }]
    };
  });
};

const convertStrapiToTiptap = (strapiContent) => {
  if (!strapiContent) {
    return {
      type: 'doc',
      content: [{ type: 'paragraph' }]
    };
  }

  const content = Array.isArray(strapiContent) ? strapiContent : 
                 typeof strapiContent === 'object' && strapiContent.content ? strapiContent.content : 
                 [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];

  return {
    type: 'doc',
    content: content.map(node => {
      if (node.type === 'heading') {
        return {
          type: 'heading',
          attrs: { level: node.level },
          content: node.children?.map(child => ({
            type: 'text',
            text: child.text || '',
            marks: [
              ...(child.bold ? [{ type: 'bold' }] : []),
              ...(child.italic ? [{ type: 'italic' }] : [])
            ]
          }))
        };
      }

      if (node.type === 'paragraph') {
        return {
          type: 'paragraph',
          content: node.children?.map(child => ({
            type: 'text',
            text: child.text || '',
            marks: [
              ...(child.bold ? [{ type: 'bold' }] : []),
              ...(child.italic ? [{ type: 'italic' }] : [])
            ]
          }))
        };
      }

      if (node.type === 'list') {
        return {
          type: node.format === 'ordered' ? 'orderedList' : 'bulletList',
          content: node.children?.map(item => ({
            type: 'listItem',
            content: item.children?.map(paragraph => ({
              type: 'paragraph',
              content: paragraph.children?.map(child => ({
                type: 'text',
                text: child.text || '',
                marks: [
                  ...(child.bold ? [{ type: 'bold' }] : []),
                  ...(child.italic ? [{ type: 'italic' }] : [])
                ]
              }))
            }))
          }))
        };
      }

      return {
        type: 'paragraph',
        content: [{ type: 'text', text: '' }]
      };
    })
  };
};

const TiptapEditor = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: convertStrapiToTiptap(content),
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const converted = convertTiptapToStrapi(json);
      onChange({ content: converted });
    }
  });

  React.useEffect(() => {
    if (editor && content) {
      const newContent = convertStrapiToTiptap(content);
      if (JSON.stringify(editor.getJSON()) !== JSON.stringify(newContent)) {
        editor.commands.setContent(newContent);
      }
    }
  }, [content, editor]);

  return (
    <div className="tiptap-editor">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
