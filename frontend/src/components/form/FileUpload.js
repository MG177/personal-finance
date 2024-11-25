import React, { useRef } from 'react';
import { IonIcon } from '@ionic/react';
import { closeCircle, camera } from 'ionicons/icons';

const FileUpload = ({ files, onFileSelect, onFileRemove, existingFiles = [], onExistingFileRemove }) => {
  const fileInputRef = useRef(null);
  console.log(files);
  
  
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    onFileSelect(selectedFiles);
  };

  return (
    <div className="form-group photo-upload-container">
      <label htmlFor="photo" className="photo-upload-label">
        Photos (optional)
      </label>
      <div className="photo-upload-content">
        <div className="photos-grid">
          {/* Existing Images */}
          {existingFiles.map((file) => (
            <div key={file.id} className="photo-preview">
              <img src={file.url} alt="Existing preview" />
              <button
                type="button"
                className="remove-photo-btn"
                onClick={() => onExistingFileRemove(file.id)}
              >
                <IonIcon icon={closeCircle} />
              </button>
            </div>
          ))}

          {/* New Files */}
          {files.map((file, index) => (
            <div key={index} className="photo-preview">
              <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
              <button
                type="button"
                className="remove-photo-btn"
                onClick={() => onFileRemove(index)}
              >
                <IonIcon icon={closeCircle} />
              </button>
            </div>
          ))}

          <div 
            className="photo-upload-placeholder"
            onClick={() => fileInputRef.current?.click()}
          >
            <IonIcon icon={camera} />
            <span>Add Photos</span>
          </div>
        </div>
        <input
          type="file"
          id="photo"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          multiple
        />
      </div>
    </div>
  );
};

export default FileUpload;
