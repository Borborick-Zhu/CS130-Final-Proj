from supabase._async.client import AsyncClient as Client, create_client
from supabase.lib.client_options import ClientOptions
from app.config import settings

# async def get_supabase_client(authorization: str = None) -> Client:
#     headers = {}
#     if authorization:
#         headers["Authorization"] = authorization

#     return await create_client(
#         settings.SUPABASE_URL,
#         settings.SUPABASE_KEY,
#         options=ClientOptions(
#             headers=headers,
#             persist_session=False,
#         )
#     )

async def get_supabase_client() -> Client:
    headers = {}

    return await create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_KEY,
        options=ClientOptions(
            headers=headers,
            persist_session=False,
        )
    )