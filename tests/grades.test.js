import { describe, expect, it } from 'vitest';
import { GRADE_CLASSES, gradeClass, gradeOf, pickGrade } from '../src/lib/grades.mjs';

describe('hadith grade classes', () => {
  it('has the four categories', () => expect(GRADE_CLASSES).toEqual(['s', 'h', 'd', 'm']));
  it('maps recorded wording to the right class', () => {
    expect(gradeOf('Sahih')).toBe('s');
    expect(gradeOf('Sahih Lighairihi')).toBe('s');
    expect(gradeOf('Isnaad Sahih')).toBe('s');
    expect(gradeOf('Hasan')).toBe('h');
    expect(gradeOf('Hasan Lighairihi')).toBe('h');
    expect(gradeOf('Daif')).toBe('d');
    expect(gradeOf('Very Daif')).toBe('d');
    expect(gradeOf('Munkar')).toBe('d');
    expect(gradeOf('Shadh')).toBe('d');
    expect(gradeOf('Mawdu')).toBe('m');
    expect(gradeOf('Maudu')).toBe('m');
    expect(gradeOf('Fabricated')).toBe('m');
    expect(gradeOf('موضوع')).toBe('m');
    expect(gradeOf('-')).toBe('');
    expect(gradeOf('')).toBe('');
  });
  it('fabricated is never mixed up with weak', () => {
    expect(gradeOf("Da'if")).toBe('d');
    expect(gradeOf('Daif Munkar')).toBe('d');
    expect(gradeOf('Mawdu')).not.toBe('d');
  });
  it('Bukhari and Muslim are sahih by consensus; ungraded books stay ungraded', () => {
    expect(gradeClass([], 'bukhari')).toBe('s');
    expect(gradeClass(undefined, 'muslim')).toBe('s');
    expect(gradeClass([], 'ahmad')).toBe('');
    expect(gradeClass(undefined, 'mishkat')).toBe('');
  });
  it("uses Al-Albani's grading first when several scholars graded", () => {
    const g = [['Zubair Ali Zai', 'Daif'], ['Al-Albani', 'Sahih']];
    expect(pickGrade(g)).toEqual(['Al-Albani', 'Sahih']);
    expect(gradeClass(g, 'abudawud')).toBe('s');
    expect(gradeClass([['Someone Else', 'Hasan']], 'abudawud')).toBe('h');
  });
});
