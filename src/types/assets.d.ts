/**
 * TypeScript 6 refuses side-effect imports of non-code extensions unless
 * they are declared. Next handles the actual bundling; these declarations
 * only satisfy the type checker.
 */
declare module '*.css';
declare module '*.svg' {
  import type { FC, SVGProps } from 'react';
  const ReactComponent: FC<SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
