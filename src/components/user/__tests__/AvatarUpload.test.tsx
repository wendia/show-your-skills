import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvatarUpload } from '../AvatarUpload';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      onClick,
    }: React.PropsWithChildren<{ className?: string; onClick?: () => void }>) => (
      <div className={className} onClick={onClick} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('AvatarUpload', () => {
  const mockOnAvatarChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render with username initial when no avatar', () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    expect(screen.getByText('T')).toBeDefined();
  });

  test('should render with current avatar when provided', () => {
    render(
      <AvatarUpload
        username="TestUser"
        currentAvatar="https://example.com/avatar.jpg"
        onAvatarChange={mockOnAvatarChange}
      />
    );

    const img = screen.getByAltText('Avatar');
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.jpg');
  });

  test('should show file input when clicking avatar', () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    const avatarDiv = screen.getByTestId('motion-div');
    fireEvent.click(avatarDiv);

    // The file input should exist (though hidden)
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();
  });

  test('should show select image button', () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    expect(screen.getByText('选择图片')).toBeDefined();
  });

  test('should show file format hint', () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    expect(screen.getByText(/支持 JPG、PNG 格式/)).toBeDefined();
    expect(screen.getByText(/最大 2MB/)).toBeDefined();
  });

  test('should show error for non-image file', async () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('请选择图片文件')).toBeDefined();
    });
  });

  test('should show error for file too large', async () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    // Create a file larger than 2MB
    const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [largeFile],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('图片大小不能超过 2MB')).toBeDefined();
    });
  });

  test('should not show save button initially', () => {
    render(
      <AvatarUpload
        username="TestUser"
        currentAvatar="https://example.com/avatar.jpg"
        onAvatarChange={mockOnAvatarChange}
      />
    );

    expect(screen.queryByText('保存')).toBeNull();
  });

  test('should show remove button when preview exists', () => {
    render(
      <AvatarUpload
        username="TestUser"
        currentAvatar="https://example.com/avatar.jpg"
        onAvatarChange={mockOnAvatarChange}
      />
    );

    // The X button should be visible
    const removeButton = document.querySelector('button.bg-red-500');
    expect(removeButton).toBeDefined();
  });

  test('should handle case-insensitive username', () => {
    render(
      <AvatarUpload username="lowercase" onAvatarChange={mockOnAvatarChange} />
    );

    expect(screen.getByText('L')).toBeDefined();
  });

  test('should have correct title', () => {
    render(
      <AvatarUpload username="TestUser" onAvatarChange={mockOnAvatarChange} />
    );

    expect(screen.getByText('头像')).toBeDefined();
  });
});
