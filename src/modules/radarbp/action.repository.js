  import pool from "../../config/db.js";

  class ActionRepository {
    async findAll() {
      const sql = `
        SELECT *
        FROM actions
        ORDER BY due_date;
      `;

      const { rows } = await pool.query(sql);

      return rows;
    }

    async findById(id) {
      const sql = `
        SELECT *
        FROM actions
        WHERE id = $1;
      `;

      const { rows } = await pool.query(sql, [id]);

      return rows[0];
    }

    async findByVisit(visitId) {
      const sql = `
        SELECT *
        FROM actions
        WHERE visit_id = $1
        ORDER BY due_date;
      `;

      const { rows } = await pool.query(sql, [visitId]);

      return rows;
    }

    async findByContract(cr) {
      const sql = `
        SELECT *
        FROM actions
        WHERE cr = $1
        ORDER BY due_date;
      `;

      const { rows } = await pool.query(sql, [cr]);

      return rows;
    }

    async create(data) {
      const visitQuery = `
        SELECT id
        FROM visits
        WHERE cr = $1
        ORDER BY visit_date DESC NULLS LAST,
                created_at DESC NULLS LAST
        LIMIT 1;
      `;

      const visitResult = await pool.query(visitQuery, [data.cr]);

      if (visitResult.rows.length === 0) {
        throw new Error(
          "Não existe nenhuma visita cadastrada para este contrato."
        );
      }

      const visitId = visitResult.rows[0].id;

      const sql = `
        INSERT INTO actions (
          visit_id,
          cr,
          description,
          execution,
          indicators,
          owner,
          due_date,
          stage,
          files
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9
        )
        RETURNING *;
      `;

      const values = [
        visitId,
        data.cr,
        data.description,
        data.execution,
        data.indicators,
        data.owner,
        data.due_date,
        data.stage,
        JSON.stringify(data.files || [])
      ];

      const { rows } = await pool.query(sql, values);

      return rows[0];
    }

    async update(id, data) {
      const visitQuery = `
        SELECT id
        FROM visits
        WHERE cr = $1
        ORDER BY visit_date DESC NULLS LAST,
                created_at DESC NULLS LAST
        LIMIT 1;
      `;

      const visitResult = await pool.query(visitQuery, [data.cr]);

      if (visitResult.rows.length === 0) {
        throw new Error(
          "Não existe nenhuma visita cadastrada para este CR."
        );
      }

      const visitId = visitResult.rows[0].id;

      const current = await this.findById(id);

      const sql = `
        UPDATE actions
        SET
          visit_id = $1,
          cr = $2,
          description = $3,
          execution = $4,
          indicators = $5,
          owner = $6,
          due_date = $7,
          stage = $8,
          files = $9,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *;
      `;

      const values = [
        visitId,
        data.cr,
        data.description,
        data.execution,
        data.indicators,
        data.owner,
        data.due_date,
        data.stage,
        JSON.stringify(data.files ?? current.files ?? []),
        id
      ];

      const { rows } = await pool.query(sql, values);

      return rows[0];
    }

    async delete(id) {
      await pool.query(
        `
        DELETE FROM actions
        WHERE id = $1
        `,
        [id]
      );

      return true;
    }

    // ============================
    // Arquivos
    // ============================

    async getFiles(actionId) {
      const { rows } = await pool.query(
        `
        SELECT files
        FROM actions
        WHERE id = $1
        `,
        [actionId]
      );

      if (!rows.length) {
        return [];
      }

      return rows[0].files || [];
    }

    async getFile(actionId, fileId) {
      const files = await this.getFiles(actionId);

      return files.find(file => file.id === fileId) || null;
    }

    async addFile(actionId, file) {
      const sql = `
        UPDATE actions
        SET
          files = COALESCE(files, '[]'::jsonb) || $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING files;
      `;

      const { rows } = await pool.query(sql, [
        JSON.stringify([file]),
        actionId
      ]);

      return rows[0].files;
    }

    async removeFile(actionId, fileId) {
      const files = await this.getFiles(actionId);

      const updatedFiles = files.filter(file => file.id !== fileId);

      const { rows } = await pool.query(
        `
        UPDATE actions
        SET
          files = $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING files;
        `,
        [
          JSON.stringify(updatedFiles),
          actionId
        ]
      );

      return rows[0].files;
    }

    async replaceFiles(actionId, files) {
      const { rows } = await pool.query(
        `
        UPDATE actions
        SET
          files = $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING files;
        `,
        [
          JSON.stringify(files),
          actionId
        ]
      );

      return rows[0].files;
    }
  }

  export default new ActionRepository();