import React from "react";
import { LogOut, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import Button from "./button";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Xác nhận đăng xuất
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LogOut className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Lưu ý:</p>
                <p className="mt-1">
                  Sau khi đăng xuất, bạn sẽ cần đăng nhập lại để tiếp tục sử dụng hệ thống.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-4 py-2"
          >
            Hủy
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Đang đăng xuất...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
