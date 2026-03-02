import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  currentAvatar?: string;
  username: string;
  onAvatarChange: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, username, onAvatarChange }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!preview) return;

    setIsUploading(true);
    setError(null);

    try {
      // In a real app, you would upload to a server
      // For now, we'll just use the data URL
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onAvatarChange(preview);
    } catch {
      setError('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onAvatarChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          头像
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={cn(
                'w-24 h-24 rounded-full overflow-hidden',
                'bg-gradient-to-br from-purple-500 to-pink-500',
                'flex items-center justify-center',
                'cursor-pointer border-4 border-white/20',
                'shadow-lg'
              )}
              onClick={triggerFileInput}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {username[0].toUpperCase()}
                </span>
              )}
            </motion.div>

            {preview && (
              <button
                onClick={handleRemove}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={triggerFileInput}
            >
              <Upload className="w-4 h-4 mr-2" />
              选择图片
            </Button>

            {preview && preview !== currentAvatar && (
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? '上传中...' : '保存'}
              </Button>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <div className="text-xs text-gray-500 text-center">
            支持 JPG、PNG 格式<br />
            最大 2MB
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
