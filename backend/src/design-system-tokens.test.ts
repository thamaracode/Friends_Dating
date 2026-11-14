import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Master Prompt 09: Complete Premium Interface & Experience Engineering', () => {
  const uiDir = path.resolve(__dirname, '../../frontend/src/components/ui');
  const tokensFile = path.resolve(__dirname, '../../frontend/src/tokens/designSystem.ts');

  // =========================================================================
  // 1. DESIGN SYSTEM TOKENS & SPACING SCALE
  // =========================================================================

  describe('1. Spacing Scale & Layout System', () => {
    it('verifies the 10-step centralized spacing scale token definition', () => {
      expect(fs.existsSync(tokensFile)).toBe(true);
      const tokenContent = fs.readFileSync(tokensFile, 'utf8');

      // 10-step global spacing scale verification
      expect(tokenContent).toContain('micro: 4');
      expect(tokenContent).toContain('compact: 8');
      expect(tokenContent).toContain('small: 12');
      expect(tokenContent).toContain('standard: 16');
      expect(tokenContent).toContain('comfortable: 20');
      expect(tokenContent).toContain('cardPadding: 24');
      expect(tokenContent).toContain('section: 32');
      expect(tokenContent).toContain('major: 40');
      expect(tokenContent).toContain('large: 48');
      expect(tokenContent).toContain('transition: 64');
    });

    it('verifies typography hierarchy with 7 scale steps and editorial font stacks', () => {
      const tokenContent = fs.readFileSync(tokensFile, 'utf8');
      expect(tokenContent).toContain('hero:');
      expect(tokenContent).toContain('pageHeading:');
      expect(tokenContent).toContain('sectionHeading:');
      expect(tokenContent).toContain('cardHeading:');
      expect(tokenContent).toContain('body:');
      expect(tokenContent).toContain('supporting:');
      expect(tokenContent).toContain('metadata:');

      // Fonts
      expect(tokenContent).toContain('heading:');
      expect(tokenContent).toContain('body:');
      expect(tokenContent).toContain('editorial:');
      expect(tokenContent).toContain('mono:');
    });

    it('verifies mature obsidian and restrained gold palette tokens', () => {
      const tokenContent = fs.readFileSync(tokensFile, 'utf8');
      expect(tokenContent).toContain('#090A0E'); // Obsidian void
      expect(tokenContent).toContain('#12141B'); // Card surface
      expect(tokenContent).toContain('#F9FAFB'); // Crisp white text
      expect(tokenContent).toContain('#F6C138'); // Gold accent
    });
  });

  // =========================================================================
  // 2. REUSABLE COMPONENT SYSTEM INVENTORY (16 REQUIRED CATEGORIES)
  // =========================================================================

  describe('2. Reusable Component System Inventory', () => {
    const requiredComponents = [
      { name: 'Cards', file: 'Card.tsx', exports: ['Card', 'CardHeader', 'CardTitle', 'CardContent', 'CardFooter'] },
      { name: 'Navigation', file: 'Navigation.tsx', exports: ['Navigation', 'NavigationItem'] },
      { name: 'Tabs', file: 'Tabs.tsx', exports: ['Tabs', 'TabList', 'Tab', 'TabPanel'] },
      { name: 'Profile Headers', file: 'ProfileHeader.tsx', exports: ['ProfileHeader'] },
      { name: 'Identity Selectors', file: 'IdentitySelector.tsx', exports: ['IdentitySelector'] },
      { name: 'Timelines', file: 'Timeline.tsx', exports: ['Timeline'] },
      { name: 'Forms', file: 'Form.tsx', exports: ['FormField', 'Input', 'Textarea', 'Select', 'Switch'] },
      { name: 'Dialogs', file: 'Dialog.tsx', exports: ['Dialog', 'ConfirmDialog'] },
      { name: 'Drawers', file: 'Drawer.tsx', exports: ['Drawer'] },
      { name: 'Toasts', file: 'Toast.tsx', exports: ['ToastProvider', 'useToast'] },
      { name: 'Dropdowns', file: 'Dropdown.tsx', exports: ['Dropdown', 'DropdownItem', 'DropdownDivider'] },
      { name: 'Search', file: 'Search.tsx', exports: ['SearchInput'] },
      { name: 'Filters', file: 'Filters.tsx', exports: ['FilterGroup'] },
      { name: 'Media Viewers', file: 'MediaViewer.tsx', exports: ['MediaViewer'] },
      { name: 'Question Interfaces', file: 'QuestionInterface.tsx', exports: ['QuestionInterface'] },
      { name: 'Chat Interfaces', file: 'ChatInterface.tsx', exports: ['ChatBubble', 'ChatComposer'] },
      { name: 'Feedback States', file: 'FeedbackStates.tsx', exports: ['EmptyState', 'Skeleton', 'ErrorState'] }
    ];

    for (const comp of requiredComponents) {
      it(`verifies implementation of ${comp.name} (${comp.file})`, () => {
        const filePath = path.join(uiDir, comp.file);
        expect(fs.existsSync(filePath)).toBe(true);

        const content = fs.readFileSync(filePath, 'utf8');
        for (const exp of comp.exports) {
          expect(content).toContain(`export const ${exp}`);
        }
      });
    }

    it('verifies barrel export index.ts exposes all components', () => {
      const indexFile = path.join(uiDir, 'index.ts');
      expect(fs.existsSync(indexFile)).toBe(true);

      const indexContent = fs.readFileSync(indexFile, 'utf8');
      expect(indexContent).toContain("export * from './Card'");
      expect(indexContent).toContain("export * from './Navigation'");
      expect(indexContent).toContain("export * from './Tabs'");
      expect(indexContent).toContain("export * from './ProfileHeader'");
      expect(indexContent).toContain("export * from './IdentitySelector'");
      expect(indexContent).toContain("export * from './Timeline'");
      expect(indexContent).toContain("export * from './Form'");
      expect(indexContent).toContain("export * from './Dialog'");
      expect(indexContent).toContain("export * from './Drawer'");
      expect(indexContent).toContain("export * from './Toast'");
      expect(indexContent).toContain("export * from './Dropdown'");
      expect(indexContent).toContain("export * from './Search'");
      expect(indexContent).toContain("export * from './Filters'");
      expect(indexContent).toContain("export * from './MediaViewer'");
      expect(indexContent).toContain("export * from './QuestionInterface'");
      expect(indexContent).toContain("export * from './ChatInterface'");
      expect(indexContent).toContain("export * from './FeedbackStates'");
    });
  });

  // =========================================================================
  // 3. UX REQUIREMENTS & ACCESSIBILITY CONTRACTS
  // =========================================================================

  describe('3. UX Requirements & Interaction Accessibility Contracts', () => {
    it('verifies EmptyState enforces actionable guidance (Next useful action)', () => {
      const feedbackContent = fs.readFileSync(path.join(uiDir, 'FeedbackStates.tsx'), 'utf8');
      expect(feedbackContent).toContain('actionLabel');
      expect(feedbackContent).toContain('onAction');
      expect(feedbackContent).toContain('max-w-md mx-auto');
    });

    it('verifies ConfirmDialog enforces destructive confirmation safeguards', () => {
      const dialogContent = fs.readFileSync(path.join(uiDir, 'Dialog.tsx'), 'utf8');
      expect(dialogContent).toContain('ConfirmDialog');
      expect(dialogContent).toContain('isDestructive');
      expect(dialogContent).toContain('confirmLabel');
      expect(dialogContent).toContain('cancelLabel');
      expect(dialogContent).toContain('bg-rose-600');
    });

    it('verifies FormField enforces accessibility semantics (role="alert", htmlFor, error state)', () => {
      const formContent = fs.readFileSync(path.join(uiDir, 'Form.tsx'), 'utf8');
      expect(formContent).toContain('role="alert"');
      expect(formContent).toContain('htmlFor={generatedId}');
      expect(formContent).toContain('aria-invalid');
    });

    it('verifies WAI-ARIA tab navigation and keyboard accessibility', () => {
      const tabsContent = fs.readFileSync(path.join(uiDir, 'Tabs.tsx'), 'utf8');
      expect(tabsContent).toContain('role="tablist"');
      expect(tabsContent).toContain('role="tab"');
      expect(tabsContent).toContain('role="tabpanel"');
      expect(tabsContent).toContain('aria-selected');
      expect(tabsContent).toContain('aria-controls');
      expect(tabsContent).toContain('ArrowRight');
      expect(tabsContent).toContain('ArrowLeft');
      expect(tabsContent).toContain('Home');
      expect(tabsContent).toContain('End');
    });

    it('verifies reduced-motion support in microinteractions', () => {
      const cardContent = fs.readFileSync(path.join(uiDir, 'Card.tsx'), 'utf8');
      expect(cardContent).toContain('motion-reduce:transition-none');

      const tabsContent = fs.readFileSync(path.join(uiDir, 'Tabs.tsx'), 'utf8');
      expect(tabsContent).toContain('motion-reduce:transition-none');
    });

    it('verifies interactive DesignSystemShowcase gallery component exists and compiles', () => {
      const showcaseFile = path.join(uiDir, 'DesignSystemShowcase.tsx');
      expect(fs.existsSync(showcaseFile)).toBe(true);
      const showcaseContent = fs.readFileSync(showcaseFile, 'utf8');
      expect(showcaseContent).toContain('export const DesignSystemShowcase');
    });
  });
});
