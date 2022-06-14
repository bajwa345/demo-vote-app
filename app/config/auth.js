
const Utf8 = require('crypto-js/enc-utf8');
const Base64 = require('crypto-js/enc-base64');
const HmacSHA256 = require('crypto-js/hmac-sha256');


     let _secret = 'YOUR_VERY_CONFIDENTIAL_SECRET_FOR_SIGNING_JWT_TOKENS!!!';
     function _base64url(source)
     {
         // Encode in classical base64
         let encodedSource = Base64.stringify(source);

         // Remove padding equal characters
         encodedSource = encodedSource.replace(/=+$/, '');

         // Replace characters according to base64url specifications
         encodedSource = encodedSource.replace(/\+/g, '-');
         encodedSource = encodedSource.replace(/\//g, '_');

         // Return the base64 encoded string
         return encodedSource;
     }

     function _b64decode(str)
    {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let output = '';

        str = String(str).replace(/=+$/, '');

        if ( str.length % 4 === 1 )
        {
            throw new Error(
                '\'atob\' failed: The string to be decoded is not correctly encoded.'
            );
        }

        /* eslint-disable */
        for (
            // initialize result and counters
            let bc = 0, bs, buffer, idx = 0;
            // get next character
            (buffer = str.charAt(idx++));
            // character found in table? initialize bit storage and add its ascii value;
            ~buffer &&
            (
                (bs = bc % 4 ? bs * 64 + buffer : buffer),
                    // and if not first of each 4 characters,
                    // convert the first 8 bits to one ascii character
                bc++ % 4
            )
                ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
                : 0
        )
        {
            // try to find character in table (0-63, not found => -1)
            buffer = chars.indexOf(buffer);
        }
        /* eslint-enable */

        return output;
    }

     function _b64DecodeUnicode(str)
    {
        return decodeURIComponent(
            Array.prototype.map
                 .call(_b64decode(str), (c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                 .join('')
        );
    }

    function _urlBase64Decode(str)
    {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch ( output.length % 4 )
        {
            case 0:
            {
                break;
            }
            case 2:
            {
                output += '==';
                break;
            }
            case 3:
            {
                output += '=';
                break;
            }
            default:
            {
                throw Error('Illegal base64url string!');
            }
        }
        return _b64DecodeUnicode(output);
    }

     //generateJWTToken() {
     exports.generateJWTToken = (userid, username, candidateid) => {

         // Define token header
         const header = {
             alg: 'HS256',
             typ: 'JWT'
         };

         // Calculate the issued at and expiration dates
         const date = new Date();
         const iat = Math.floor(date.getTime() / 1000);
         const exp = Math.floor((date.setDate(date.getDate() + 7)) / 1000);

         // Define token payload
         const payload = {
             iss: 'Voogle',
             iat: iat,
             exp: exp,
             usid: userid,
             username: username,
             cnid: candidateid
         };

         // Stringify and encode the header
         const stringifiedHeader = Utf8.parse(JSON.stringify(header));
         const encodedHeader = _base64url(stringifiedHeader);

         // Stringify and encode the payload
         const stringifiedPayload = Utf8.parse(JSON.stringify(payload));
         const encodedPayload = _base64url(stringifiedPayload);

         // Sign the encoded header and mock-api
         let signature = encodedHeader + '.' + encodedPayload;
         signature = HmacSHA256(signature, _secret);
         signature = _base64url(signature);

         // Build and return the token
         return encodedHeader + '.' + encodedPayload + '.' + signature;
     }

     exports._verifyJWTToken = (token) => {

         // Split the token into parts
         const parts = token.split('.');
         const header = parts[0];
         const payload = parts[1];
         const signature = parts[2];

         // Re-sign and encode the header and payload using the secret
         const signatureCheck = _base64url(HmacSHA256(header + '.' + payload, _secret));

         // Verify that the resulting signature is valid
         return (signature === signatureCheck);
     }


     exports._decodeToken = (token) => {

         // Return if there is no token
         if ( !token ) { return null; }

         const parts = token.split('.'); // Split the token

         if ( parts.length !== 3 )
         {
             throw new Error(token + 'The inspected token doesn\'t appear to be a JWT. Check to make sure it has three parts and see https://jwt.io for more.');
         }

         // Decode the token using the Base64 decoder
         const decoded = _urlBase64Decode(parts[1]);

         if ( !decoded )
         {
             throw new Error('Cannot decode the token.');
         }

         return JSON.parse(decoded);
     }

