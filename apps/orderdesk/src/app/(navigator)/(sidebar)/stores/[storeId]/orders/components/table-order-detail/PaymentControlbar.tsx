"use client";

import { AlertDialogAction } from "@spaceorder/ui/components/alert-dialog/alert-dialog";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import { Button } from "@spaceorder/ui/components/button";
import { SetStateAction } from "react";

export default function PaymentControlbar({
  children,
}: {
  children: React.ReactNode;
}) {
  const dialogTitle = "해당 기능은 준비 중입니다.";
  const dialogDescription = "업데이트를 기다려주세요!";
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <AlertDialogWrapper
          title={dialogTitle}
          description={dialogDescription}
          renderFooter={CloseDialog}
        >
          <Button
            className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
            variant={"secondary"}
          >
            할인
          </Button>
        </AlertDialogWrapper>
        <AlertDialogWrapper
          title={dialogTitle}
          description={dialogDescription}
          renderFooter={CloseDialog}
        >
          <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">
            메뉴 추가
          </Button>
        </AlertDialogWrapper>
      </div>
      {children}
    </>
  );
}

function CloseDialog(setOpen: (value: SetStateAction<boolean>) => void) {
  return (
    <AlertDialogAction onClick={() => setOpen(false)}>확인</AlertDialogAction>
  );
}
