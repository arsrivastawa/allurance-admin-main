import { usePathname } from 'next/navigation';

// ----------------------------------------------------------------------

export function useActiveLinkold(path, deep = true) {
  const pathname = usePathname();

  const checkPath = path.startsWith('#');

  const currentPath = path === '/' ? '/' : `${path}/`;

  const normalActive = !checkPath && pathname === currentPath;

  const deepActive = !checkPath && pathname.includes(currentPath);

  return deep ? deepActive : normalActive;
}

export function useActiveLink(paths, deep = true) {
  const pathname = usePathname();

  const checkPaths = Array.isArray(paths) && paths.some((path) => path.startsWith('#'));

  const currentPaths = Array.isArray(paths)
    ? paths.map((path) => (path === '/' ? '/' : `${path}/`))
    : [paths === '/' ? '/' : `${paths}/`];

  const normalActive = !checkPaths && currentPaths.includes(pathname);

  const deepActive = !checkPaths && currentPaths.some((path) => pathname.includes(path));

  return deep ? deepActive : normalActive;
}
