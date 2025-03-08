import { useState } from 'react';
import { Group, Text, Button } from '@mantine/core';
import { IconUpload, IconFileText, IconX, IconCheck } from '@tabler/icons-react';
import { UploadIcon, FileIcon, Cross1Icon } from '@radix-ui/react-icons';
import { Dropzone, DropzoneProps, PDF_MIME_TYPE } from '@mantine/dropzone';
import { notifications } from '@mantine/notifications';

interface FileDropProps extends Partial<DropzoneProps> {
  onUploadStart?: () => void;
  onUploadEnd?: (files: File[]) => Promise<void> | void;
}

export function FileDrop({ onUploadStart, onUploadEnd, ...props }: FileDropProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrop = (files: File[]) => {
    console.log('Accepted files:', files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    if (onUploadStart) onUploadStart();

    const count = selectedFiles.length;
    const notifId = notifications.show({
      loading: true,
      title: 'Uploading files',
      message: `Uploading ${count} file${count > 1 ? 's' : ''}...`,
      autoClose: false,
      withCloseButton: false,
    });

    try {
      if (onUploadEnd) {
        await onUploadEnd(selectedFiles);
      }
      notifications.update({
        id: notifId,
        color: 'teal',
        title: 'Files uploaded',
        message: `${count} file${count > 1 ? 's' : ''} uploaded successfully.`,
        loading: false,
        autoClose: 3000,
      });
      setSelectedFiles([]); // Clear selected files after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      notifications.update({
        id: notifId,
        color: 'red',
        title: 'Upload failed',
        message: 'File upload failed. Please try again later.',
        loading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <>
      <Dropzone
        onDrop={handleDrop}
        onReject={(files) => console.log('Rejected files:', files)}
        maxSize={5 * 1024 ** 2}
        accept={PDF_MIME_TYPE}
        {...props}
        style={{
          border: '1px dashed var(--mantine-color-zinc-7)',
          borderRadius: 'var(--mantine-radius-sm)',
          cursor: 'pointer',
        }}
      >
        <Group justify="center" p="md" gap="sm" mih={160} style={{ pointerEvents: 'none' }}>
          <Dropzone.Accept>
            <UploadIcon style={{ width: 30, height: 30 }} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <Cross1Icon style={{ width: 30, height: 30 }} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <FileIcon style={{ width: 30, height: 30 }} />
          </Dropzone.Idle>
          <div>
            <Text size="md" inline>
              Drag PDFs here or click to browse files
            </Text>
            <Text size="xs" c="dimmed" inline mt={7}>
              Attach as many PDFs as you like, max 5mb each
            </Text>
          </div>
        </Group>
      </Dropzone>
      <Text size="xs" c="dimmed" mt="sm">
        {selectedFiles.length > 0
          ? `Selected files: ${selectedFiles.map((file) => file.name).join(', ')}`
          : 'No files selected'}
      </Text>
      {selectedFiles.length > 0 && (
        <Button mt="sm" onClick={handleUpload}>
          Upload Files
        </Button>
      )}
    </>
  );
}
