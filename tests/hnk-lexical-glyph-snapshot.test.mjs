import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const url=new URL('../sources/materialized/hnk-lexical-glyph-bindings.v1.json',import.meta.url);
const snapshot=JSON.parse(await readFile(url,'utf8'));

test('lexical glyph snapshot is pinned to HNK-KODE canon commit',()=>{
  assert.equal(snapshot.source.commit,'341591138d5428295c9bf23944eb8a8bd863c305');
  assert.equal(snapshot.source.authority,'HNK_CANON');
  assert.equal(snapshot.bindings.length,5);
});

test('SIGILKODE snapshot cannot infer semantics from geometry',()=>{
  assert.equal(snapshot.policy.semanticInference,false);
  assert.equal(snapshot.policy.codepointIsProjection,true);
});

test('snapshot identities are unique',()=>{
  for(const key of ['glyphId','sigilId','mathId','codePoint']){
    assert.equal(new Set(snapshot.bindings.map(x=>x[key])).size,5,key);
  }
});