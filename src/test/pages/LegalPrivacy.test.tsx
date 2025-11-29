import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LegalPrivacy from '../../pages/LegalPrivacy';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LegalPrivacy Page', () => {
  it('renders header', () => {
    renderWithRouter(<LegalPrivacy />);
    expect(screen.getByRole('heading', { level: 1, name: 'プライバシーポリシー' })).toBeInTheDocument();
    expect(screen.getByText('本サービスにおける個人情報の取り扱いについて')).toBeInTheDocument();
  });

  it('renders table of contents', () => {
    renderWithRouter(<LegalPrivacy />);
    expect(screen.getByRole('heading', { level: 2, name: '目次' })).toBeInTheDocument();
    // 目次内のリンクを確認
    const tocLinks = screen.getAllByText('1. 収集する情報の種類');
    expect(tocLinks.length).toBeGreaterThan(0);
    const tocLinks2 = screen.getAllByText('2. 利用目的');
    expect(tocLinks2.length).toBeGreaterThan(0);
    const tocLinks8 = screen.getAllByText('8. プライバシーポリシーの変更について');
    expect(tocLinks8.length).toBeGreaterThan(0);
  });

  it('renders all sections', () => {
    renderWithRouter(<LegalPrivacy />);
    expect(screen.getByRole('heading', { level: 2, name: '1. 収集する情報の種類' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '2. 利用目的' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '3. 情報の保存期間' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '4. 第三者提供の有無' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '5. 外部サービス利用状況' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '6. 安全管理措置' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '7. ユーザーからの問い合わせ窓口' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '8. プライバシーポリシーの変更について' })).toBeInTheDocument();
  });

  it('renders Firebase information', () => {
    renderWithRouter(<LegalPrivacy />);
    expect(screen.getByText(/Firebase（Google）/)).toBeInTheDocument();
    expect(screen.getByText('Firebase Authentication: ユーザー認証')).toBeInTheDocument();
  });

  it('renders related links', () => {
    renderWithRouter(<LegalPrivacy />);
    expect(screen.getByRole('heading', { level: 2, name: '関連リンク' })).toBeInTheDocument();
    const operatorLink = screen.getByRole('link', { name: '運営者情報' });
    expect(operatorLink).toBeInTheDocument();
    expect(operatorLink).toHaveAttribute('href', '/legal/operator');
    
    const contactLink = screen.getByRole('link', { name: 'お問い合わせ' });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('has anchor links in table of contents', () => {
    renderWithRouter(<LegalPrivacy />);
    const tocLinks = screen.getAllByRole('link');
    const section1Link = tocLinks.find(link => link.getAttribute('href') === '#section-1');
    expect(section1Link).toBeInTheDocument();
  });
});
