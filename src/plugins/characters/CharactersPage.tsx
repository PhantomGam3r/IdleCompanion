import { useAccount } from '../../ui/AccountProvider';
import { SKILL_NAMES } from '../../core/parse/parseSave';

export function CharactersPage() {
  const { account } = useAccount();
  if (!account) {
    return (
      <section className="panel empty-state">
        <h1>Characters</h1>
        <p>Sign in to compare skills across your roster.</p>
      </section>
    );
  }

  const skills = SKILL_NAMES.filter((skill) =>
    account.characters.some((character) => (character.skills[skill] ?? 0) > 0)
  );

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Side-by-side roster</p>
          <h1>Characters</h1>
          <p className="muted">{account.characters.length} characters on this save</p>
        </div>
      </header>
      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                {account.characters.map((character) => (
                  <th key={character.index}>
                    {character.name}
                    <div className="muted">{character.className}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skills.map((skill) => (
                <tr key={skill}>
                  <td>{skill}</td>
                  {account.characters.map((character) => (
                    <td key={character.index}>{character.skills[skill] ?? 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
