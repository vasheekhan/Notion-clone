import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import type { Workspace, Page } from "../types";
import {
  getWorkspaces,
  createWorkspace as apiCreateWorkspace,
} from "../services/workspace.service";
import {
  getPages,
  createPage as apiCreatePage,
  deletePage as apiDeletePage,
  updatePage as apiUpdatePage,
} from "../services/page.service";
import { getCurrentUser, logoutUser } from "../services/auth.service";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

interface WorkspaceContextType {
  updateUser: (updates: Partial<User>) => void;
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  pages: Page[];
  currentPage: Page | null;
  loading: boolean;

  // Optimistic state indicators
  creatingWorkspace: boolean;
  creatingPage: boolean;

  setCurrentWorkspace: (w: Workspace) => void;
  setCurrentPage: (p: Page | null) => void;

  createWorkspace: (name: string) => Promise<void>;
  refreshPages: () => Promise<void>;
  createPage: (parentId?: string | null) => Promise<Page | null>;
  deletePage: (id: string) => Promise<void>;
  renamePage: (id: string, title: string) => Promise<void>;

  logout: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

// Utility functions
const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const getCurrentTimestamp = () => new Date().toISOString();

function flattenPages(pages: any[]): Page[] {
  const flat: Page[] = [];

  function walk(items: any[]) {
    for (const item of items) {
      const { children, ...page } = item;
      flat.push(page as Page);

      if (children && children.length > 0) {
        walk(children);
      }
    }
  }

  walk(pages);
  return flat;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Optimistic loading states
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [creatingPage, setCreatingPage] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [userRes, wsRes] = await Promise.all([
          getCurrentUser().catch(() => null),
          getWorkspaces(),
        ]);

        

        if (userRes?.user) setUser(userRes.user);

        setWorkspaces(wsRes.workspaces || []);

        if (wsRes.workspaces?.length) {
          setCurrentWorkspace(wsRes.workspaces[0]);
        }
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!currentWorkspace) return;
    refreshPages();
  }, [currentWorkspace]);

  async function refreshPages() {
    if (!currentWorkspace) return;

    try {
      const res = await getPages(currentWorkspace.id);
      const flatPages = flattenPages(res.pages || []);
      setPages(flatPages);
    } catch (err) {
      console.error("Failed to load pages:", err);
    }
  }

  
  const createWorkspace = useCallback(async (name: string) => {
    if (!user) return;

    const tempId = generateTempId();
    const timestamp = getCurrentTimestamp();
    
    const optimisticWorkspace: Workspace = {
      id: tempId,
      name,
      icon: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      ownerId: user.id,
    };

    
    setWorkspaces(prev => [...prev, optimisticWorkspace]);
    setCurrentWorkspace(optimisticWorkspace);
    setCreatingWorkspace(true);

    try {
      // 🔄 Background API call
      const res = await apiCreateWorkspace({ name });
      
      // ✅ Replace optimistic with real data
      setWorkspaces(prev => 
        prev.map(w => w.id === tempId ? res.workspace : w)
      );
      setCurrentWorkspace(res.workspace);
      
      
      
    } catch (err: any) {
      console.error("❌ Workspace creation failed:", err);
      
      
      setWorkspaces(prev => prev.filter(w => w.id !== tempId));
      
      // Set back to previous workspace
      const remainingWorkspaces = workspaces.filter(w => w.id !== tempId);
      setCurrentWorkspace(remainingWorkspaces[0] || null);
      
     
      throw err;
    } finally {
      setCreatingWorkspace(false);
    }
  }, [user, workspaces]);

  
  const createPage = useCallback(async (parentId: string | null = null): Promise<Page | null> => {
    if (!currentWorkspace || !user) return null;

    const tempId = generateTempId();
    const timestamp = getCurrentTimestamp();
    
    // Calculate position for new page
    const siblingPages = pages.filter(p => p.parentId === parentId && !p.isDeleted);
    const newPosition = siblingPages.length > 0 ? Math.max(...siblingPages.map(p => p.position)) + 1 : 0;
    
    const optimisticPage: Page = {
      id: tempId,
      title: "Untitled",
      content: null,
      icon: null,
      coverImage: null,
      position: newPosition,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      workspaceId: currentWorkspace.id,
      authorId: user.id,
      parentId,
    };

    
    setPages(prev => [...prev, optimisticPage]);
    setCurrentPage(optimisticPage);
    setCreatingPage(true);

    try {
     
      const res = await apiCreatePage({
        workspaceId: currentWorkspace.id,
        parentId,
        title: "Untitled",
      });

      setPages(prev => 
        prev.map(p => p.id === tempId ? res.page : p)
      );
      setCurrentPage(res.page);
      
      
      return res.page;
      
    } catch (err: any) {
      console.error(" Page creation failed:", err);
      
  
      setPages(prev => prev.filter(p => p.id !== tempId));
      
      // Set current page back to previous or null
      const remainingPages = pages.filter(p => p.id !== tempId);
      const lastPage = remainingPages[remainingPages.length - 1];
      setCurrentPage(lastPage || null);
      
      return null;
    } finally {
      setCreatingPage(false);
    }
  }, [currentWorkspace, user, pages]);


  const deletePage = useCallback(async (id: string) => {
    // Store page for potential rollback
    const pageToDelete = pages.find(p => p.id === id);
    if (!pageToDelete) return;


    setPages(prev => prev.filter(p => p.id !== id));
    
    if (currentPage?.id === id) {
      setCurrentPage(null);
    }

    try {

      await apiDeletePage(id);

      
    } catch (err: any) {
      console.error(" Page deletion failed:", err);
      

      setPages(prev => [...prev, pageToDelete]);
      
      // Restore as current page if it was the current one
      if (currentPage?.id === id) {
        setCurrentPage(pageToDelete);
      }
      
      throw err;
    }
  }, [pages, currentPage]);


  const renamePage = useCallback(async (id: string, title: string) => {
    const pageToUpdate = pages.find(p => p.id === id);
    if (!pageToUpdate) return;

    const originalTitle = pageToUpdate.title;
    const timestamp = getCurrentTimestamp();

  
    setPages(prev => 
      prev.map(p => p.id === id ? { ...p, title, updatedAt: timestamp } : p)
    );
    
    if (currentPage?.id === id) {
      setCurrentPage({ ...currentPage, title, updatedAt: timestamp });
    }

    try {
  
      await apiUpdatePage(id, { title });
     
      
    } catch (err: any) {
      console.error(" Page rename failed:", err);
      
      
      setPages(prev => 
        prev.map(p => p.id === id ? { ...p, title: originalTitle } : p)
      );
      
      if (currentPage?.id === id) {
        setCurrentPage({ ...currentPage, title: originalTitle });
      }
      
      throw err;
    }
  }, [pages, currentPage]);

  function updateUser(updates: Partial<User>) {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }

  async function logout() {
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setPages([]);
      setCurrentPage(null);
      window.location.href = "/";
    }
  }

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        pages,
        currentPage,
        loading,
        creatingWorkspace,
        creatingPage,
        setCurrentWorkspace,
        updateUser,
        setCurrentPage,
        createWorkspace,
        refreshPages,
        createPage,
        deletePage,
        renamePage,
        logout,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}