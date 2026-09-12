## Purpose

Splits a URL string into its parts and rebuilds it byte-for-byte, so users can inspect and edit any single part without anything else in the URL being normalized, re-encoded, or reordered.

## Requirements

### Requirement: Tokenize using the generic URI syntax
The system SHALL split any input string into scheme, userinfo (username and password), host, port, path, query, and fragment, following the RFC 3986 generic syntax, for any scheme. It SHALL record whether each delimiter (`:`, `//`, `@`, `?`, `#`) is present, separately from the part's value. Input without a scheme SHALL be treated as a relative reference.

#### Scenario: Full http URL
- **WHEN** the input is `https://user:pw@api.example.com:8443/v1/items?q=a+b#top`
- **THEN** the parts are scheme `https`, username `user`, password `pw`, host `api.example.com`, port `8443`, path `/v1/items`, query `q=a+b`, fragment `top`

#### Scenario: Custom scheme
- **WHEN** the input is `myapp://open/settings?tab=2`
- **THEN** the parts are scheme `myapp`, host `open`, path `/settings`, query `tab=2`

#### Scenario: Opaque scheme without authority
- **WHEN** the input is `mailto:a@b.c`
- **THEN** the parts are scheme `mailto`, no authority, path `a@b.c`

#### Scenario: IPv6 host with port
- **WHEN** the input is `http://[::1]:8080/`
- **THEN** the host is `[::1]` and the port is `8080`

#### Scenario: Empty delimiter parts differ from absent ones
- **WHEN** the input is `https://a.com/?#`
- **THEN** the query and fragment are both present and empty, unlike `https://a.com/`, where both are absent

### Requirement: Lossless round-trip
Serializing the tokenized parts of any input string SHALL reproduce that input exactly, including letter case, percent-encoding, dot segments, default ports, and characters that are invalid per the specs.

#### Scenario: Round-trip preserves details that browsers normalize
- **WHEN** the input `HTTP://Example.COM:80/a/./b/../c?q=a+b&x&y=&q=2#Frag` is tokenized and serialized
- **THEN** the output is exactly `HTTP://Example.COM:80/a/./b/../c?q=a+b&x&y=&q=2#Frag`

#### Scenario: Malformed input still round-trips
- **WHEN** the input is `ht!tp://a b/%zz?%`
- **THEN** serializing its parts returns `ht!tp://a b/%zz?%`

### Requirement: Query as an ordered parameter list
The system SHALL represent the query as an ordered list of parameters, split on `&`, each holding a raw key and a raw value. A parameter without `=` SHALL have no value, which is different from an empty value. Order, duplicate keys, and empty segments (`a&&b`) SHALL be preserved.

#### Scenario: Duplicates, flags, and empty values
- **WHEN** the query is `q=1&x&y=&q=2`
- **THEN** the parameters are, in order: `q`=`1`, `x` with no value, `y` with empty value, `q`=`2`

#### Scenario: Empty segments preserved
- **WHEN** the query `a=1&&b=2` is tokenized and serialized
- **THEN** the output is `a=1&&b=2`

### Requirement: Editing a part changes only that part
Replacing the value of one part, or adding, removing, reordering, or editing one query parameter, SHALL change only the corresponding substring of the serialized URL. Removing a part SHALL also remove its delimiter, and adding a part SHALL insert its delimiter.

#### Scenario: Edit host only
- **WHEN** the host of `HTTP://Example.COM:80/a?q=a+b` is set to `test.local`
- **THEN** the result is `HTTP://test.local:80/a?q=a+b`

#### Scenario: Remove a query parameter
- **WHEN** the parameter `x` is removed from `?q=1&x&q=2`
- **THEN** the query becomes `q=1&q=2`

#### Scenario: Remove the port
- **WHEN** the port of `http://a.com:8080/` is removed
- **THEN** the result is `http://a.com/`

### Requirement: Decoded view with style-preserving re-encoding
The system SHALL provide a decoded (human-readable) view of each raw value. When a decoded value is edited, the system SHALL re-encode only the characters that need encoding in that part, and SHALL keep the original parameter's space style (`+` or `%20`). New parameters SHALL use `%20`. An invalid percent sequence SHALL be kept literally and not cause an error.

#### Scenario: Plus style preserved
- **WHEN** the raw value `a+b` is shown decoded as `a b` and edited to `a b c`
- **THEN** the new raw value is `a+b+c`

#### Scenario: New parameter uses percent style
- **WHEN** a new parameter is added with decoded value `hello world`
- **THEN** its raw value is `hello%20world`

#### Scenario: Invalid percent sequence
- **WHEN** a raw value contains `%zz`
- **THEN** the decoded view shows `%zz` and no error is raised

### Requirement: Browser normalization diagnostics
For `http` and `https` URLs, the system SHALL report whether a browser accepts the URL and, if it does, the normalized form a browser would use (WHATWG URL Standard) when that differs from the input. For other schemes, it SHALL report validity only.

#### Scenario: Normalized form differs
- **WHEN** the input is `HTTP://Example.COM:80/a/./b`
- **THEN** diagnostics report the URL as valid and the browser form as `http://example.com/a/b`

#### Scenario: Browser rejects URL
- **WHEN** the input is `http://exa mple.com/`
- **THEN** diagnostics report that a browser rejects the URL

#### Scenario: No difference
- **WHEN** the input is already in normalized form
- **THEN** diagnostics report no normalization difference
