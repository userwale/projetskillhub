import React, { useState } from 'react';
import { Form, Input, Button, Upload, Radio, message, Card } from 'antd';
import { UploadOutlined, PlayCircleOutlined, FileTextOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

const AddCourseContent = () => {
  const [contentType, setContentType] = useState('video');
  const [fileList, setFileList] = useState([]);
  const [existingContent, setExistingContent] = useState([
    { id: 1, title: 'Introduction to HTML', type: 'video', date: '2023-05-15' },
    { id: 2, title: 'CSS Basics', type: 'document', date: '2023-05-20' }
  ]);
  
  const { courseId } = useParams();

  const beforeUpload = (file) => {
    // Validation du type de fichier
    if (contentType === 'video' && !file.type.includes('video/')) {
      message.error('You can only upload video files!');
      return false;
    }
    
    if (contentType === 'document') {
      const isPdfOrWord = file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      if (!isPdfOrWord) {
        message.error('You can only upload PDF or Word documents!');
        return false;
      }
    }
    
    // Validation de la taille du fichier (max 300 Mo)
    const isLt300M = file.size / 1024 / 1024 < 300;
    if (!isLt300M) {
      message.error('File must be smaller than 300MB!');
      return false;
    }
    
    return true;
  };

  const onFinish = async (values) => {
    if (fileList.length === 0) {
        message.error('Please select a file to upload');
        return;
    }

    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('type', contentType); // Devient doc_type dans le modèle
    formData.append('file', fileList[0].originFileObj);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8072/api/instructor/courses/${courseId}/add-content`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add content');
        }

        // Mise à jour de l'état avec la nouvelle structure
        setExistingContent([...existingContent, {
            id: existingContent.length + 1,
            title: values.title,
            doc_type: contentType,
            url: data.content.url,
            date: new Date().toISOString().split('T')[0]
        }]);

        setFileList([]);
        message.success('Content added successfully!');
    } catch (error) {
        console.error('Error adding content:', error);
        message.error(error.message || 'Failed to add content');
    }
};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Add Course Content</h1>
      
      <Card title="Add New Content" style={{ marginBottom: '20px' }}>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item
            name="title"
            label="Content Title"
            rules={[{ required: true, message: 'Please enter the content title' }]}
          >
            <Input placeholder="Enter course content title" />
          </Form.Item>

          <Form.Item label="Content Type">
            <Radio.Group 
              value={contentType} 
              onChange={(e) => {
                setContentType(e.target.value);
                setFileList([]); // Clear selected file when changing type
              }}
            >
              <Radio value="video">
                <PlayCircleOutlined /> Video
              </Radio>
              <Radio value="document">
                <FileTextOutlined /> Document
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label={`Upload ${contentType === 'video' ? 'Video' : 'Document'}`}>
            <Upload
            // Gestion du fichier sélectionné 
              fileList={fileList} //Quand on ajoute un fichier, Ant Design le met dans le fileList(Upload qui gère l'UI et  onChange qui met à jour fileList dans ton useState) 
              beforeUpload={beforeUpload}
              onChange={({ fileList }) => setFileList(fileList)}
              accept={contentType === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                {contentType === 'video' ? 'Select Video File' : 'Select Document File'}
              </Button>
            </Upload>
            <p style={{ marginTop: '8px', color: '#666' }}>
              {contentType === 'video' 
                ? 'Supported formats: MP4, MOV, AVI (max 300MB)' 
                : 'Supported formats: PDF, DOC, DOCX (max 300MB)'}
            </p>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Content to Course
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddCourseContent;
