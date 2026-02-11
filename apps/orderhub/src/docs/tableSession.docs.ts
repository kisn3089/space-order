import { applyDecorators } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import {
  PublicTableSessionDto,
  TableWithStoreContextDto,
} from "src/dto/public/table.dto";
import { SessionTokenDto } from "src/dto/public/session.dto";
import { CreateSessionPayloadDto } from "src/dto/session.dto";
import { paramsDocs } from "./params.docs";

const meta = {
  findOrCreate: {
    summary: "활성화된 세션 조회 또는 생성",
    ok: { status: 201, description: "세션 조회 또는 생성 성공" },
  },
  getList: {
    summary: "세션 목록 조회 (매장 소유자)",
    ok: { status: 200, description: "세션 목록 반환" },
  },
  getUnique: {
    summary: "특정 세션 조회 (매장 소유자)",
    ok: { status: 200, description: "세션 정보 반환" },
  },
  getAliveSession: {
    summary: "활성 세션 조회 (고객)",
    ok: { status: 200, description: "활성 세션 정보 반환" },
  },
  getStoreContext: {
    summary: "세션의 매장 컨텍스트 조회",
    ok: { status: 200, description: "테이블, 매장, 메뉴 정보 반환" },
  },
  update: {
    summary: "세션 수정 (만료 연장 등)",
    ok: { status: 200, description: "세션 수정 성공" },
  },
  unauthorized: { status: 401, description: "인증되지 않은 요청" },
  sessionUnauthorized: { status: 401, description: "세션 인증 실패" },
  notFound: { status: 404, description: "세션을 찾을 수 없음" },
};

export const DocsSessionGetList = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: meta.getList.summary }),
    ApiParam(paramsDocs.storeId),
    ApiQuery(paramsDocs.query.filter.session),
    ApiQuery(paramsDocs.query.include.orderItems),
    ApiResponse({ ...meta.getList.ok, type: [PublicTableSessionDto] }),
    ApiResponse(meta.unauthorized)
  );

export const DocsSessionGetUnique = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: meta.getUnique.summary }),
    ApiParam(paramsDocs.storeId),
    ApiParam(paramsDocs.sessionId),
    ApiQuery(paramsDocs.query.include.orderItems),
    ApiResponse({ ...meta.getUnique.ok, type: PublicTableSessionDto }),
    ApiResponse(meta.unauthorized),
    ApiResponse(meta.notFound)
  );

export const DocsSessionUpdate = () =>
  applyDecorators(
    ApiBearerAuth(),
    ApiOperation({ summary: meta.update.summary }),
    ApiParam(paramsDocs.storeId),
    ApiParam(paramsDocs.sessionId),
    ApiResponse({ ...meta.update.ok, type: PublicTableSessionDto }),
    ApiResponse(meta.sessionUnauthorized)
  );

export const DocsSessionFindOrCreate = () =>
  applyDecorators(
    ApiOperation({ summary: meta.findOrCreate.summary }),
    ApiBody({ type: CreateSessionPayloadDto }),
    ApiResponse({ ...meta.findOrCreate.ok, type: SessionTokenDto })
  );

export const DocsSessionGetAlive = () =>
  applyDecorators(
    ApiOperation({ summary: meta.getAliveSession.summary }),
    ApiParam(paramsDocs.sessionToken),
    ApiResponse({ ...meta.getAliveSession.ok, type: PublicTableSessionDto }),
    ApiResponse(meta.sessionUnauthorized)
  );

export const DocsSessionUpdateByCustomer = () =>
  applyDecorators(
    ApiOperation({ summary: meta.update.summary }),
    ApiParam(paramsDocs.sessionToken),
    ApiResponse({ ...meta.update.ok, type: PublicTableSessionDto }),
    ApiResponse(meta.sessionUnauthorized)
  );

export const DocsSessionGetStoreContext = () =>
  applyDecorators(
    ApiOperation({ summary: meta.getStoreContext.summary }),
    ApiParam(paramsDocs.sessionToken),
    ApiResponse({ ...meta.getStoreContext.ok, type: TableWithStoreContextDto }),
    ApiResponse(meta.sessionUnauthorized)
  );
