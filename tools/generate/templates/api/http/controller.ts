import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Result } from "@domain/shared";
import type {
  Create{{Entity}}Request,
  Create{{Entity}}Response,
} from "@application/{{context}}/usecases/Create{{Entity}}UseCase";
import type { {{Entity}}ReadQueries } from "@domain/{{context}}/queries/{{Entity}}ReadQueries";
import { to{{Entity}}Id } from "@domain/{{context}}/entities/{{Entity}}";
import { enrichHttpRequestEvent } from "@infrastructure/logging/http-event";
import { getRequestId } from "@api/http/request-context";

const HTTP_STATUS: Record<string, ContentfulStatusCode> = {
  {{Context}}_NOT_FOUND: 404,
  {{Context}}_INVALID_STATE: 409,
};

function toHttpResponse<T>(
  c: Context,
  result: Result<T>,
  successStatus: ContentfulStatusCode = 200,
): Response {
  if (result.ok) {
    return c.json(result.value, successStatus);
  }
  return c.json(
    { error: result.error.code, message: result.error.message, requestId: getRequestId(c) },
    HTTP_STATUS[result.error.code] ?? 400,
  );
}

type Create{{Entity}}Fn = (req: Create{{Entity}}Request) => Promise<Result<Create{{Entity}}Response>>;

export class {{Entity}}Controller {
  constructor(
    private readonly create{{Entity}}: Create{{Entity}}Fn,
    private readonly {{entity}}ReadQueries: {{Entity}}ReadQueries,
  ) {}

  async create(c: Context): Promise<Response> {
    const body = await c.req.json<{
      title: string;
      description?: string;
    }>();

    const result = await this.create{{Entity}}({
      title: body.title,
      description: body.description || "",
    });

    enrichHttpRequestEvent(c, { operation: "POST /{{context}}s" });
    return toHttpResponse(c, result, 201);
  }

  async getById(c: Context): Promise<Response> {
    const rawId = c.req.param("{{entity}}Id");
    if (!rawId) {
      return c.json(
        { error: "MISSING_PARAM", message: "{{entity}}Id is required", requestId: getRequestId(c) },
        400,
      );
    }
    const {{entity}}Id = to{{Entity}}Id(rawId);
    const {{entity}} = await this.{{entity}}ReadQueries.findById({{entity}}Id);
    if (!{{entity}}) {
      return c.json(
        { error: "{{Context}}_NOT_FOUND", message: "{{Entity}} not found", requestId: getRequestId(c) },
        404,
      );
    }
    enrichHttpRequestEvent(c, { operation: "GET /{{context}}s/:{{entity}}Id" });
    return c.json({{entity}}, 200);
  }

  async list(c: Context): Promise<Response> {
    const results = await this.{{entity}}ReadQueries.findAll();
    enrichHttpRequestEvent(c, { operation: "GET /{{context}}s" });
    return c.json(results, 200);
  }
}
