module.exports = {
  rules: {
    // Custom rule to prevent direct Text imports from react-native
    'no-direct-text-import': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prevent direct Text imports from react-native to ensure font scaling is disabled',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noDirectTextImport: 'Use Text from "@/components/Text" instead of "react-native" to ensure font scaling is disabled',
        },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            if (node.source.value === 'react-native') {
              const textSpecifier = node.specifiers.find(
                spec => spec.type === 'ImportSpecifier' && spec.imported.name === 'Text'
              );
              if (textSpecifier) {
                context.report({
                  node: textSpecifier,
                  messageId: 'noDirectTextImport',
                  fix(fixer) {
                    // Suggest replacement with custom Text component
                    return fixer.replaceText(
                      node.source,
                      '"@/components/Text"'
                    );
                  },
                });
              }
            }
          },
        };
      },
    },
  },
}; 