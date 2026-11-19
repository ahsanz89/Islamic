"""Makes the generated Android project sign its release build with the upload key (values come from gradle.properties)."""
p = 'android/app/build.gradle'
s = open(p).read()
assert 'signingConfigs {' in s, 'signingConfigs block not found'
rel = (
    "    signingConfigs {\n"
    "        release {\n"
    "            storeFile file(DALIL_STORE_FILE)\n"
    "            storePassword DALIL_STORE_PASSWORD\n"
    "            keyAlias DALIL_KEY_ALIAS\n"
    "            keyPassword DALIL_KEY_PASSWORD\n"
    "        }\n"
)
s = s.replace("    signingConfigs {\n", rel, 1)
i = s.index('buildTypes {')
j = s.index('release {', i)
old = 'signingConfig signingConfigs.debug'
k = s.index(old, j)
s = s[:k] + 'signingConfig signingConfigs.release' + s[k + len(old):]
open(p, 'w').write(s)
print('release signing configured')
