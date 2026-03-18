// Direct imports from tool sources for dev mode
// These bypass Module Federation and import directly from source

// @ts-expect-error - Alias resolution
import JsonTool from 'jsonFormatterApp/Tool';
// @ts-expect-error - Alias resolution  
import RegexTool from 'regexTesterApp/Tool';
// @ts-expect-error - Alias resolution
import JwtTool from 'jwtDecoderApp/Tool';
// @ts-expect-error - Alias resolution
import Base64Tool from 'base64ToolApp/Tool';
// @ts-expect-error - Alias resolution
import PasswordTool from 'passwordGeneratorApp/Tool';

export { JsonTool, RegexTool, JwtTool, Base64Tool, PasswordTool };
