import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import LegalOperator from '../../pages/LegalOperator';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('LegalOperator Page', () => {
  it('renders header', () => {
    renderWithRouter(<LegalOperator />);
    expect(screen.getByRole('heading', { level: 1, name: '運営者情報' })).toBeInTheDocument();
    expect(screen.getByText('本サービスの運営者に関する情報です')).toBeInTheDocument();
  });

  it('renders operator information section', () => {
    renderWithRouter(<LegalOperator />);
    expect(screen.getByRole('heading', { level: 2, name: '運営者について' })).toBeInTheDocument();
    expect(screen.getByText(/cocottu/)).toBeInTheDocument();
    const projectTexts = screen.getAllByText(/個人開発プロジェクト/);
    expect(projectTexts.length).toBeGreaterThan(0);
  });

  it('renders service information section', () => {
    renderWithRouter(<LegalOperator />);
    expect(screen.getByRole('heading', { level: 2, name: '本サービスについて' })).toBeInTheDocument();
    expect(screen.getByText(/贈答品の記録・管理/)).toBeInTheDocument();
  });

  it('renders contact section with link', () => {
    renderWithRouter(<LegalOperator />);
    expect(screen.getByRole('heading', { level: 2, name: '連絡先' })).toBeInTheDocument();
    const contactLink = screen.getByRole('link', { name: /お問い合わせページ/ });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('renders disclaimer section', () => {
    renderWithRouter(<LegalOperator />);
    expect(screen.getByRole('heading', { level: 2, name: '免責事項' })).toBeInTheDocument();
    const projectTexts = screen.getAllByText(/個人開発プロジェクト/);
    expect(projectTexts.length).toBeGreaterThan(0);
  });

  it('renders related links', () => {
    renderWithRouter(<LegalOperator />);
    expect(screen.getByRole('heading', { level: 2, name: '関連リンク' })).toBeInTheDocument();
    const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute('href', '/legal/privacy');
    
    const contactLink = screen.getByRole('link', { name: 'お問い合わせ' });
    expect(contactLink).toBeInTheDocument();
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});
